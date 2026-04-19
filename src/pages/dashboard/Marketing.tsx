import { Megaphone } from "lucide-react";
import { ComingSoon } from "./ComingSoon";

export default function Marketing() {
  return (
    <ComingSoon
      title="Marketing"
      icon={Megaphone}
      description="Grow your audience with built-in marketing tools — email campaigns, social sharing, abandoned cart recovery, and more."
      features={[
        "Email campaigns & newsletters",
        "Abandoned cart recovery",
        "Social media integrations",
        "SEO & storefront optimization",
      ]}
    />
  );
}
