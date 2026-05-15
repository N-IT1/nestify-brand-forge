import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Store as StoreIcon, ArrowRight, ShieldCheck, Truck, Tag, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketplaceNavbar } from "@/components/marketplace/MarketplaceNavbar";
import { MarketplaceMobileNav } from "@/components/marketplace/MarketplaceMobileNav";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { Footer } from "@/components/landing/Footer";
import { useCart, formatPrice, CartProduct } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

interface StoreData {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  theme_color: string | null;
}

interface CategoryData {
  name: string;
  stores: StoreData;
}

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
  const [allCategories, setAllCategories] = useState<CategoryData[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, description, price, image_url, inventory_count, category_id, store_id, categories(name), stores!inner(id, name, slug, currency)"
          )
          .eq("is_active", true)
          .gt("inventory_count", 0)
          .not("stores.slug", "is", null)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("categories").select("name, stores!inner(id, name, slug, description, logo_url, theme_color)").not("stores.slug", "is", null)
      ]);

      if (!productsResult.error && productsResult.data) {
        setProducts(productsResult.data as unknown as MarketplaceProduct[]);
      }
      
      if (!categoriesResult.error && categoriesResult.data) {
        setAllCategories(categoriesResult.data as unknown as CategoryData[]);
        const names = Array.from(
          new Set(
            categoriesResult.data
              .map((c) => c.name)
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

  const filteredStores = useMemo(() => {
    if (!selectedCategory && !search) return [];
    
    const q = search.trim().toLowerCase();
    const matchingStoresMap = new Map<string, StoreData>();
    
    allCategories.forEach(cat => {
      let matches = false;
      if (selectedCategory && cat.name === selectedCategory) {
        matches = true;
      } else if (!selectedCategory && q) {
        if (cat.name.toLowerCase().includes(q) || cat.stores?.name.toLowerCase().includes(q)) {
          matches = true;
        }
      }
      
      if (matches && cat.stores && cat.stores.slug) {
        matchingStoresMap.set(cat.stores.id, cat.stores);
      }
    });
    
    return Array.from(matchingStoresMap.values());
  }, [allCategories, search, selectedCategory]);

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
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <MarketplaceNavbar searchValue={search} onSearchChange={setSearch} />
      <CartDrawer />

      {/* Premium hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3 block">
                The Trunt Marketplace
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 leading-[1.1]">
                Curated goods from <span className="text-gradient">independent sellers</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-lg">
                Discover thoughtfully made products from trusted brands — shipped fast, priced fair.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button asChild size="lg" className="rounded-full px-7 h-12 shadow-soft text-sm">
                <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
                  <StoreIcon className="w-4 h-4 mr-2" />
                  Sell on Trunt
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 h-12 bg-background/60 text-sm">
                <Link to="/about">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <span><span className="text-foreground font-medium">Verified sellers</span> · shop with confidence</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <span><span className="text-foreground font-medium">Fast delivery</span> · across Nigeria</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <span><span className="text-foreground font-medium">Fair pricing</span> · direct from brands</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {/* Category chips */}
        {categoryNames.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Browse by category</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4 md:mx-0 md:px-0">
              <Button
                variant={selectedCategory === null ? "default" : "secondary"}
                size="sm"
                className="rounded-full flex-shrink-0 h-9 px-4 text-sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categoryNames.map((name) => (
                <Button
                  key={name}
                  variant={selectedCategory === name ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full flex-shrink-0 h-9 px-4 text-sm"
                  onClick={() => setSelectedCategory(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 && filteredStores.length === 0 ? (
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
              <Button asChild className="mt-6 rounded-full h-11 px-6">
                <Link to={user ? "/dashboard" : "/auth?mode=signup&seller=1"}>
                  <StoreIcon className="w-4 h-4 mr-2" />
                  Start Selling
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredStores.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">
                    Stores {selectedCategory ? `in ${selectedCategory}` : 'Found'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredStores.map((s) => (
                    <Link
                      key={s.id}
                      to={s.slug ? `/store/${s.slug}` : "#"}
                      className="group"
                    >
                      <Card className="bg-card border-0 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 h-full">
                        <div
                          className="h-24 bg-gradient-accent"
                          style={s.theme_color ? { background: s.theme_color } : undefined}
                        />
                        <CardContent className="p-5 -mt-10">
                          <div className="w-16 h-16 rounded-2xl bg-card border-4 border-card shadow-soft flex items-center justify-center overflow-hidden">
                            {s.logo_url ? (
                              <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <StoreIcon className="w-7 h-7 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="mt-3 font-display font-bold text-lg group-hover:text-primary transition-colors">
                            {s.name}
                          </h3>
                          {s.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {s.description}
                            </p>
                          )}
                          <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                            Visit store
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filtered.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">
                    {selectedCategory ? `${selectedCategory} Products` : "All Products"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {filtered.map((p) => (
                    <Card
                  key={p.id}
                  className="bg-card border-0 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 group flex flex-col"
                >
                  <Link to={p.stores?.slug ? `/store/${p.stores.slug}` : "#"} className="block">
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
                  </Link>
                  <CardContent className="p-3 md:p-4 flex flex-col flex-1">
                    {p.categories?.name && (
                      <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                        {p.categories.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm md:text-base mt-1 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    {p.stores?.slug && (
                      <Link
                        to={`/store/${p.stores.slug}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 line-clamp-1 inline-flex items-center gap-1"
                      >
                        <StoreIcon className="w-3 h-3" />
                        {p.stores.name}
                      </Link>
                    )}
                    <div className="mt-auto pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                        {formatPrice(p.price, p.stores?.currency ?? "NGN")}
                      </span>
                      <Button
                        size="sm"
                        className="rounded-full h-9 px-3 text-xs sm:text-sm shadow-sm w-full sm:w-auto"
                        onClick={() => handleAdd(p)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />
      <MarketplaceMobileNav />
    </div>
  );
}
