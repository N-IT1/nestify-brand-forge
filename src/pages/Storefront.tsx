import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Store {
  id: string;
  name: string;
  description: string | null;
  theme_color: string | null;
  logo_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  image_url: string | null;
  category_id: string | null;
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchStore() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, description, theme_color, logo_url")
        .eq("slug", slug)
        .maybeSingle();

      if (storeError || !storeData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStore(storeData);

      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, description, price, inventory_count, is_active, image_url, category_id, categories(name)")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("categories")
          .select("id, name")
          .eq("store_id", storeData.id)
          .order("name"),
      ]);

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setLoading(false);
    }

    fetchStore();
  }, [slug]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Store Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">
          The store you're looking for doesn't exist or hasn't been published yet.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header 
        className="py-12 px-4"
        style={{ backgroundColor: store?.theme_color || 'hsl(var(--primary))' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {store?.logo_url && (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-24 h-24 object-cover rounded-2xl mx-auto mb-4 border-4 border-background/20"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {store?.name}
          </h1>
          {store?.description && (
            <p className="text-white/80 max-w-xl mx-auto">
              {store.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-card/80 border-border/50 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No products available</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {selectedCategory
                  ? "No products in this category yet."
                  : "This store hasn't added any products yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="bg-card border-border/50 rounded-2xl overflow-hidden hover:shadow-card transition-all group"
              >
                <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {product.inventory_count === 0 && (
                    <Badge variant="destructive" className="absolute top-3 right-3 rounded-full">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  {product.categories?.name && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {product.categories.name}
                    </span>
                  )}
                  <h3 className="font-display font-semibold mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button 
                      size="sm" 
                      className="rounded-full"
                      disabled={product.inventory_count === 0}
                    >
                      {product.inventory_count > 0 ? "Buy Now" : "Sold Out"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <Link to="/" className="text-primary hover:underline">Nestify</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
