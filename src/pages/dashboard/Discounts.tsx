import { Tag } from "lucide-react";
import { ComingSoon } from "./ComingSoon";

export default function Discounts() {
  return (
    <ComingSoon
      title="Discounts"
      icon={Tag}
      description="Create promo codes, run flash sales, and reward loyal customers with flexible discount rules tailored to your store."
      features={[
        "Percentage & fixed discounts",
        "Promo codes with usage limits",
        "Buy X get Y promotions",
        "Scheduled flash sales",
      ]}
    />
  );
}
