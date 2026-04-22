import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketplaceNavbar } from "@/components/marketplace/MarketplaceNavbar";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { useCart, formatPrice, CartProduct } from "@/contexts/CartContext";

interface Store {
  id: string;
  name: string;
  description: string | null;
  theme_color: string | null;
  logo_url: string | null;
  currency: string;
  slug: string | null;
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
  const { addToCart } = useCart();
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
        .select("id, name, description, theme_color, logo_url, currency, slug")
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

      setProducts((productsResult.data as Product[]) || []);
      setCategories(categoriesResult.data || []);
      setLoading(false);
    }

    fetchStore();
  }, [slug]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const handleAdd = (product: Product) => {
    if (!store) return;
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      inventory_count: product.inventory_count,
      store_id: store.id,
      store_name: store.name,
      store_slug: store.slug,
      currency: store.currency,
    };
    addToCart(cartProduct);
  };

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
            Back to Marketplace
          </Link>
        </Button>
      </div>
    );
  }

  const currency = store?.currency || "NGN";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <MarketplaceNavbar />
      <CartDrawer />

      {/* Store Header */}
      <header
        className="relative py-16 px-4 overflow-hidden"
        style={{ backgroundColor: store?.theme_color || "hsl(var(--primary))" }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {store?.logo_url && (
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150" />
              <img
                src={store.logo_url}
                alt={store.name}
                className="relative w-28 h-28 object-cover rounded-2xl border-4 border-white/30 shadow-2xl"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 drop-shadow-lg">
            {store?.name}
          </h1>
          {store?.description && (
            <p className="text-white/90 max-w-xl mx-auto text-lg font-light">
              {store.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="lg"
              className="rounded-full px-6 shadow-sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="lg"
                className="rounded-full px-6 shadow-sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-card border-border/50 rounded-3xl shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">No products available</h3>
              <p className="text-muted-foreground text-center max-w-sm text-lg">
                {selectedCategory
                  ? "No products in this category yet."
                  : "This store hasn't added any products yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-card border-0 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="aspect-square bg-gradient-to-br from-secondary/50 to-secondary relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {product.inventory_count === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="rounded-full text-sm px-4 py-1">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.inventory_count > 0 && product.inventory_count <= 5 && (
                    <Badge className="absolute top-4 right-4 rounded-full bg-amber-500 text-white">
                      Only {product.inventory_count} left
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  {product.categories?.name && (
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      {product.categories.name}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-lg mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(product.price, currency)}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-full px-5 shadow-md"
                      disabled={product.inventory_count === 0}
                      onClick={() => handleAdd(product)}
                    >
                      {product.inventory_count > 0 ? "Add to Cart" : "Sold Out"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <Link to="/" className="text-primary font-medium hover:underline">Trunt</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
