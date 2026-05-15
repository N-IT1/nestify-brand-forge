import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Menu,
  BarChart3,
  FolderOpen,
  Tag,
  Megaphone,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const tabs = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/stores", label: "Stores", icon: Store },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
];

const drawerLinks = [
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/categories", label: "Categories", icon: FolderOpen },
  { to: "/dashboard/customers", label: "Customers", icon: Users },
  { to: "/dashboard/discounts", label: "Discounts", icon: Tag },
  { to: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
];

export function DashboardMobileNav() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || user?.email?.[0].toUpperCase() || "U";

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
      aria-label="Dashboard navigation"
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
              <tab.icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] sm:w-80 p-0 flex flex-col">
            <SheetHeader className="p-5 border-b border-border/40">
              <SheetTitle className="flex items-center">
                <Logo size="md" />
              </SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
              <Avatar className="w-10 h-10 bg-gradient-accent">
                <AvatarFallback className="bg-gradient-accent text-primary-foreground text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {drawerLinks.map((l) => {
                const active = isActive(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <l.icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            <div className="p-4 border-t border-border/40">
              <Button
                variant="outline"
                className="w-full rounded-full h-11"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
