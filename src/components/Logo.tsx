import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizes[size])}>
        {/* Nest SVG Icon */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer nest circle */}
          <circle
            cx="24"
            cy="26"
            r="18"
            className="stroke-primary"
            strokeWidth="3"
            fill="none"
          />
          {/* Inner nest weave lines */}
          <path
            d="M12 26c0-6.627 5.373-12 12-12s12 5.373 12 12"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M16 26c0-4.418 3.582-8 8-8s8 3.582 8 8"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Egg in the center */}
          <ellipse
            cx="24"
            cy="28"
            rx="5"
            ry="6"
            className="fill-secondary stroke-primary"
            strokeWidth="1.5"
          />
          {/* Small leaf accent */}
          <path
            d="M38 12c-4 0-6 4-6 4s2-4 6-4z"
            className="fill-accent"
          />
          <path
            d="M40 14c-3 0-4 3-4 3s1.5-3 4-3z"
            className="fill-primary"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-display font-bold text-foreground", textSizes[size])}>
          Trunt
        </span>
      )}
    </div>
  );
}
