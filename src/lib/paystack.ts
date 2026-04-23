// Paystack inline checkout loader + types.
// Public key is safe to ship in frontend code.
export const PAYSTACK_PUBLIC_KEY = "pk_live_d205d01794b98c53fed70124a2c2191f46f30809";

interface PaystackPopOptions {
  key: string;
  email: string;
  amount: number; // in kobo
  currency?: string;
  ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (transaction: { reference: string; status: string; trans: string; transaction: string }) => void;
  onCancel: () => void;
}

interface PaystackPopInstance {
  newTransaction: (opts: PaystackPopOptions) => void;
}

declare global {
  interface Window {
    PaystackPop?: { setup: (opts: any) => { openIframe: () => void } } & (new () => PaystackPopInstance);
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Paystack script"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}
