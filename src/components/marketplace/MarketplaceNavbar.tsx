import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Store as StoreIcon, Home, LayoutGrid, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useState, FormEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const navLinks = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/?category=all", label: "Categories", icon: LayoutGrid, match: "categories" },
  { to: "/stores", label: "Stores", icon: StoreIcon },
  { to: "/about", label: "About", icon: Info },
];

export function MarketplaceNavbar({ searchValue = "", onSearchChange }: Props) {
  const { user } = useAuth();
  const { totalCount, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    } else {
      navigate(`/?q=${encodeURIComponent(localSearch)}`);
    }
  };

  const isActive = (to: string, exact?: boolean) => {
    const path = to.split("?")[0];
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/50">
      {/* Top row: logo, search, actions */}
      <div className="container mx-auto px-4 h-16 flex items-center gap-3 md:gap-6">
        <Link to="/" className="flex items-center flex-shrink-0">
          <Logo size="md" />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder="Search products, brands and stores..."
              className="pl-11 h-11 rounded-full border-border/60 bg-secondary/40 focus-visible:ring-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            asChild
            className="hidden md:inline-flex rounded-full text-sm font-medium"
          >
            <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
              <StoreIcon className="w-4 h-4 mr-2" />
              Sell on Trunt
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </Button>

          {user ? (
            <Button asChild className="rounded-full px-5 hidden sm:inline-flex">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="rounded-full px-5 hidden sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Desktop nav row */}
      <div className="hidden md:block border-t border-border/40">
        <div className="container mx-auto px-4 h-11 flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.to, link.exact);
            return (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  "inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
