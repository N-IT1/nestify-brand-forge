import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ShoppingBag, ArrowLeft, ShoppingCart, X, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Store {
  id: string;
  name: string;
  description: string | null;
  theme_color: string | null;
  logo_url: string | null;
  currency: string;
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

interface CartItem {
  product: Product;
  quantity: number;
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'NGN') {
    return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(2)}`;
}

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStore() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, description, theme_color, logo_url, currency")
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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.inventory_count) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            return { ...item, quantity: Math.min(newQuantity, item.product.inventory_count) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
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
            Go to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  const currency = store?.currency || 'NGN';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-2xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{cartCount}</span>
        </button>
      )}

      {/* Store Header */}
      <header 
        className="relative py-16 px-4 overflow-hidden"
        style={{ backgroundColor: store?.theme_color || 'hsl(var(--primary))' }}
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
                      onClick={() => addToCart(product)}
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

      {/* Cart Drawer */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Your Cart
            </DialogTitle>
            <DialogDescription>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </DialogDescription>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-3 bg-secondary/30 rounded-2xl">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold line-clamp-1">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.price, currency)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.inventory_count}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <span className="font-bold">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-2xl">{formatPrice(cartTotal, currency)}</span>
                </div>
                <Button 
                  className="w-full rounded-full h-12 text-lg shadow-lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Coming Soon Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl text-center">
          <div className="flex flex-col items-center py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-2xl mb-3">
              Payment Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              We're working hard on integrating secure payment gateways to make your shopping experience seamless. Check back soon!
            </DialogDescription>
            <Button 
              className="mt-6 rounded-full px-8"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
