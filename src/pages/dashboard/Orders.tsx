import { ShoppingBag } from "lucide-react";
import { ComingSoon } from "./ComingSoon";

export default function Orders() {
  return (
    <ComingSoon
      title="Orders"
      icon={ShoppingBag}
      description="Manage every customer order in one place — track fulfillment, view payment status, and keep buyers updated from purchase to delivery."
      features={[
        "Order timeline & status tracking",
        "Fulfillment management",
        "Refunds & cancellations",
        "Order export & receipts",
      ]}
    />
  );
}
