import { Users } from "lucide-react";
import { ComingSoon } from "./ComingSoon";

export default function Customers() {
  return (
    <ComingSoon
      title="Customers"
      icon={Users}
      description="Build lasting relationships with your customers. Browse profiles, order history, lifetime value, and segment your audience for smarter marketing."
      features={[
        "Customer profiles & history",
        "Lifetime value tracking",
        "Audience segmentation",
        "Notes & tags per customer",
      ]}
    />
  );
}
