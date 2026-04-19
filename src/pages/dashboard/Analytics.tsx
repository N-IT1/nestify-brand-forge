import { BarChart3 } from "lucide-react";
import { ComingSoon } from "./ComingSoon";

export default function Analytics() {
  return (
    <ComingSoon
      title="Analytics"
      icon={BarChart3}
      description="Get a clear view of your store performance with revenue trends, top products, customer behavior, and conversion insights — all in one beautiful dashboard."
      features={[
        "Revenue & sales trend charts",
        "Top performing products",
        "Customer behavior insights",
        "Traffic & conversion funnels",
      ]}
    />
  );
}
