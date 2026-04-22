import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useState, FormEvent } from "react";

interface Props {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function MarketplaceNavbar({ searchValue = "", onSearchChange }: Props) {
  const { user } = useAuth();
  const { totalCount, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    } else {
      navigate(`/?q=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/50">
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
    </nav>
  );
}
