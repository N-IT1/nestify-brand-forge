import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store as StoreIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketplaceNavbar } from "@/components/marketplace/MarketplaceNavbar";
import { MarketplaceMobileNav } from "@/components/marketplace/MarketplaceMobileNav";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { Footer } from "@/components/landing/Footer";

interface StoreRow {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  theme_color: string | null;
}

export default function Stores() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("stores")
        .select("id, name, slug, description, logo_url, theme_color")
        .not("slug", "is", null)
        .order("created_at", { ascending: false })
        .limit(120);
      if (data) setStores(data as StoreRow[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <MarketplaceNavbar />
      <CartDrawer />

      <section className="border-b border-border/40 bg-gradient-hero">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3 block">
            Brands on Trunt
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
            Discover <span className="text-gradient">independent stores</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Browse curated brands and shop directly from sellers you love.
          </p>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stores.length === 0 ? (
          <Card className="bg-card border-border/50 rounded-3xl shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <StoreIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">No stores yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Be the first to open a store on Trunt.
              </p>
              <Button asChild className="rounded-full">
                <Link to="/auth?mode=signup&seller=1">
                  <StoreIcon className="w-4 h-4 mr-2" />
                  Start Selling
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stores.map((s) => (
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
        )}
      </main>

      <Footer />
      <MarketplaceMobileNav />
    </div>
  );
}
