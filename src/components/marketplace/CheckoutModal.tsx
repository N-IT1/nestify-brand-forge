import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock, ShieldCheck, CheckCircle2, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart, formatPrice, CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { loadPaystackScript } from "@/lib/paystack";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "details" | "processing" | "success";

export function CheckoutModal({ open, onOpenChange }: Props) {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [lastReference, setLastReference] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (open) {
      // Pre-load Paystack script as soon as modal opens
      loadPaystackScript().catch(() => undefined);
      setStep("details");
    }
  }, [open]);

  // Group items by store for the summary
  const grouped = useMemo(() => {
    const map = new Map<string, { storeName: string; currency: string; items: CartItem[]; subtotal: number }>();
    for (const item of items) {
      const key = item.product.store_id;
      if (!map.has(key)) {
        map.set(key, { storeName: item.product.store_name, currency: item.product.currency, items: [], subtotal: 0 });
      }
      const g = map.get(key)!;
      g.items.push(item);
      g.subtotal += item.product.price * item.quantity;
    }
    return Array.from(map.values());
  }, [items]);

  const currency = items[0]?.product.currency ?? "NGN";
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const mixedCurrencies = grouped.some((g) => g.currency !== currency);

  const handlePay = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Email required", description: "Enter a valid email so we can send your receipt.", variant: "destructive" });
      return;
    }
    if (mixedCurrencies) {
      toast({
        title: "Mixed currencies in cart",
        description: "Please check out one currency at a time.",
        variant: "destructive",
      });
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      // 1. Initialize on the server (uses secret key)
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: {
          email,
          amount: total,
          currency,
          metadata: {
            cart: items.map((i) => ({
              product_id: i.product.id,
              name: i.product.name,
              qty: i.quantity,
              store_id: i.product.store_id,
            })),
          },
        },
      });

      if (error || !data?.reference || !data?.access_code) {
        throw new Error(error?.message ?? data?.error ?? "Could not start payment");
      }

      const reference: string = data.reference;
      const accessCode: string = data.access_code;
      setLastReference(reference);

      // 2. Open Paystack inline popup with the public key
      await loadPaystackScript();
      const PaystackPopAny = (window as any).PaystackPop;
      if (!PaystackPopAny) throw new Error("Paystack failed to load");

      const popup = new PaystackPopAny();
      setStep("processing");

      popup.onSuccess = async (tx: { reference: string }) => {
        try {
          const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
            "paystack-verify",
            { body: { reference: tx.reference } },
          );
          if (verifyErr || !verifyData?.success) {
            throw new Error(verifyErr?.message ?? verifyData?.error ?? "Verification failed");
          }
          setStep("success");
          clearCart();
          toast({ title: "Payment successful", description: `Reference: ${tx.reference}` });
        } catch (err) {
          console.error(err);
          toast({
            title: "Could not verify payment",
            description: (err as Error).message,
            variant: "destructive",
          });
          setStep("details");
        } finally {
          setSubmitting(false);
        }
      };

      popup.onCancel = () => {
        setSubmitting(false);
        setStep("details");
        toast({ title: "Payment cancelled", description: "Your cart is still saved." });
      };

      popup.resumeTransaction(accessCode);
    } catch (err) {
      console.error(err);
      toast({
        title: "Checkout failed",
        description: (err as Error).message,
        variant: "destructive",
      });
      setSubmitting(false);
      setStep("details");
    }
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={(o) => (submitting ? null : onOpenChange(o))}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden">
        {step === "success" ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="font-display text-2xl mb-2">Order confirmed</DialogTitle>
            <DialogDescription className="text-base mb-1">
              Thanks — a receipt has been sent to <span className="font-medium text-foreground">{email}</span>.
            </DialogDescription>
            {lastReference && (
              <p className="text-xs text-muted-foreground mt-2">Reference: {lastReference}</p>
            )}
            <Button className="mt-6 rounded-full px-8" onClick={() => onOpenChange(false)}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-secondary/30">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Secure checkout
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Powered by Paystack · 256-bit SSL encrypted
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Order summary */}
            <div className="px-6 py-4 max-h-[40vh] overflow-y-auto">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Order summary
              </h3>
              <div className="space-y-3">
                {grouped.map((g, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground">{g.storeName}</p>
                    {g.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground line-clamp-1 pr-2">
                          {item.quantity} × {item.product.name}
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatPrice(item.product.price * item.quantity, g.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Email + total */}
            <div className="px-6 py-4 border-t border-border/50 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email for receipt
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 h-11 rounded-xl"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Total to pay</span>
                <span className="text-2xl font-bold font-display tabular-nums">
                  {formatPrice(total, currency)}
                </span>
              </div>

              {mixedCurrencies && (
                <p className="text-xs text-destructive">
                  Your cart contains items in different currencies. Please remove items from one currency to continue.
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Button
                className="w-full rounded-full h-12 text-base shadow-soft"
                onClick={handlePay}
                disabled={submitting || items.length === 0 || mixedCurrencies}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {step === "processing" ? "Awaiting payment…" : "Starting…"}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formatPrice(total, currency)}
                  </>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-3">
                By continuing you agree to Trunt's Terms of Service.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
