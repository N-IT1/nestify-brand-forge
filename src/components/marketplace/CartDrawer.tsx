import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X, Minus, Plus, Package, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart, formatPrice, CartItem } from "@/contexts/CartContext";
import { CheckoutModal } from "@/components/marketplace/CheckoutModal";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalCount } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Group by store
  const grouped = useMemo(() => {
    const map = new Map<string, { storeName: string; storeSlug: string | null; currency: string; items: CartItem[] }>();
    for (const item of items) {
      const key = item.product.store_id;
      if (!map.has(key)) {
        map.set(key, {
          storeName: item.product.store_name,
          storeSlug: item.product.store_slug,
          currency: item.product.currency,
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.entries()).map(([storeId, data]) => ({
      storeId,
      ...data,
      subtotal: data.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    }));
  }, [items]);

  const handleCheckout = () => {
    setIsOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Your Cart
            </DialogTitle>
            <DialogDescription>
              {totalCount} {totalCount === 1 ? "item" : "items"} from {grouped.length} {grouped.length === 1 ? "seller" : "sellers"}
            </DialogDescription>
          </DialogHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                {grouped.map((group) => (
                  <div key={group.storeId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <StoreIcon className="w-4 h-4 text-primary" />
                        {group.storeSlug ? (
                          <Link
                            to={`/store/${group.storeSlug}`}
                            className="hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {group.storeName}
                          </Link>
                        ) : (
                          <span>{group.storeName}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Subtotal: <span className="font-semibold text-foreground">{formatPrice(group.subtotal, group.currency)}</span>
                      </span>
                    </div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/30 rounded-2xl">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                            {item.product.image_url ? (
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.product.price, group.currency)}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQuantity(item.product.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQuantity(item.product.id, 1)}
                                disabled={item.quantity >= item.product.inventory_count}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                            <span className="font-semibold text-sm">
                              {formatPrice(item.product.price * item.quantity, group.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  Items from multiple sellers will be processed together at checkout.
                </p>
                <Button className="w-full rounded-full h-12 text-lg shadow-lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
