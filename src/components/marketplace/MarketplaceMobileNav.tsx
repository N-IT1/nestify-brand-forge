import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Store as StoreIcon,
  ShoppingCart,
  Menu,
  Info,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/?category=all", label: "Categories", icon: LayoutGrid },
  { to: "/stores", label: "Stores", icon: StoreIcon },
];

export function MarketplaceMobileNav() {
  const location = useLocation();
  const { totalCount, setIsOpen: setCartOpen } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) => {
    const path = to.split("?")[0];
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.to, tab.exact);
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <tab.icon className={cn("w-5 h-5", active && "scale-110")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* Cart tab */}
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors relative"
          aria-label="Open cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* More tab opens drawer */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-80 p-0 flex flex-col">
            <SheetHeader className="p-5 border-b border-border/40">
              <SheetTitle className="flex items-center">
                <Logo size="md" />
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                <DrawerLink to="/" icon={Home} label="Home" onClick={() => setMenuOpen(false)} />
                <DrawerLink to="/?category=all" icon={LayoutGrid} label="Categories" onClick={() => setMenuOpen(false)} />
                <DrawerLink to="/stores" icon={StoreIcon} label="Stores" onClick={() => setMenuOpen(false)} />
                <DrawerLink to="/about" icon={Info} label="About Trunt" onClick={() => setMenuOpen(false)} />
              </div>

              <div className="mt-6 pt-6 border-t border-border/40 space-y-1">
                {user ? (
                  <DrawerLink
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="My Dashboard"
                    onClick={() => setMenuOpen(false)}
                  />
                ) : (
                  <DrawerLink
                    to="/auth"
                    icon={LogIn}
                    label="Sign In"
                    onClick={() => setMenuOpen(false)}
                  />
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border/40">
              <Button asChild className="w-full rounded-full h-11" onClick={() => setMenuOpen(false)}>
                <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
                  <Logo size="sm" showText={false} className="mr-2 [&>div]:w-4 [&>div]:h-4" />
                  Sell on Trunt
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

function DrawerLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  const location = useLocation();
  const path = to.split("?")[0];
  const active = location.pathname === path;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-primary/5 hover:text-primary"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
