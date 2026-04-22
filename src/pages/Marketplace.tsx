import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Store as StoreIcon, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketplaceNavbar } from "@/components/marketplace/MarketplaceNavbar";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { Footer } from "@/components/landing/Footer";
import { useCart, formatPrice, CartProduct } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

interface MarketplaceProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  inventory_count: number;
  category_id: string | null;
  store_id: string;
  categories: { name: string } | null;
  stores: { id: string; name: string; slug: string | null; currency: string } | null;
}

export default function Marketplace() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, image_url, inventory_count, category_id, store_id, categories(name), stores!inner(id, name, slug, currency)"
        )
        .eq("is_active", true)
        .gt("inventory_count", 0)
        .not("stores.slug", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!error && data) {
        setProducts(data as unknown as MarketplaceProduct[]);
        const names = Array.from(
          new Set(
            (data as unknown as MarketplaceProduct[])
              .map((p) => p.categories?.name)
              .filter((n): n is string => Boolean(n))
          )
        ).sort();
        setCategoryNames(names);
      }
      setLoading(false);
    }
    load();
  }, []);

  // keep URL in sync with search input
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search) next.set("q", search);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory && p.categories?.name !== selectedCategory) return false;
      if (q) {
        const hay = `${p.name} ${p.description ?? ""} ${p.stores?.name ?? ""} ${p.categories?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, selectedCategory]);

  const handleAdd = (p: MarketplaceProduct) => {
    if (!p.stores) return;
    const cartProduct: CartProduct = {
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      inventory_count: p.inventory_count,
      store_id: p.store_id,
      store_name: p.stores.name,
      store_slug: p.stores.slug,
      currency: p.stores.currency,
    };
    addToCart(cartProduct);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketplaceNavbar searchValue={search} onSearchChange={setSearch} />
      <CartDrawer />

      {/* Slim hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium">Discover great products from independent sellers</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
                Shop everything on <span className="text-gradient">Trunt</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Thousands of products from trusted sellers — all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-full px-7 h-12 shadow-soft">
                <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
                  <StoreIcon className="w-4 h-4 mr-2" />
                  Become a Seller
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 h-12 bg-background/60">
                <Link to="/about">
                  Why Trunt?
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Category chips */}
        {categoryNames.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-thin">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-full flex-shrink-0"
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {categoryNames.map((name) => (
              <Button
                key={name}
                variant={selectedCategory === name ? "default" : "outline"}
                size="sm"
                className="rounded-full flex-shrink-0"
                onClick={() => setSelectedCategory(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-border/50 rounded-3xl shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">No products found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {search || selectedCategory
                  ? "Try adjusting your search or filters."
                  : "Be the first to open a store and list a product on Trunt."}
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
                  <StoreIcon className="w-4 h-4 mr-2" />
                  Start Selling
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filtered.map((p) => (
                <Card
                  key={p.id}
                  className="bg-card border-0 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-secondary/50 to-secondary relative overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {p.inventory_count > 0 && p.inventory_count <= 5 && (
                      <Badge className="absolute top-2 right-2 rounded-full bg-amber-500 text-white text-[10px] px-2">
                        Only {p.inventory_count} left
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 md:p-4 flex flex-col flex-1">
                    {p.categories?.name && (
                      <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
                        {p.categories.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm md:text-base mt-0.5 line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                    {p.stores?.slug && (
                      <Link
                        to={`/store/${p.stores.slug}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 line-clamp-1"
                      >
                        by {p.stores.name}
                      </Link>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <span className="text-base md:text-lg font-bold text-foreground">
                        {formatPrice(p.price, p.stores?.currency ?? "NGN")}
                      </span>
                      <Button
                        size="sm"
                        className="rounded-full h-8 px-3 text-xs shadow-sm"
                        onClick={() => handleAdd(p)}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
