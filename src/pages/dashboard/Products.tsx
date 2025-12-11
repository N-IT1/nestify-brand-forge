import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Package, Loader2, Trash2, Edit, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

const productSchema = z.object({
  store_id: z.string().min(1, "Please select a store"),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(100, "Product name is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  inventory_count: z.coerce.number().int().min(0, "Inventory must be 0 or more"),
  image_url: z.string().nullable().optional(),
});

type ProductValues = z.infer<typeof productSchema>;

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  store_id: string;
  image_url: string | null;
  stores: { name: string } | null;
}

interface StoreOption {
  id: string;
  name: string;
}

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { store_id: "", name: "", description: "", price: 0, inventory_count: 0, image_url: null },
  });

  async function fetchData() {
    const [productsResult, storesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, description, price, inventory_count, is_active, store_id, image_url, stores(name)")
        .order("created_at", { ascending: false }),
      supabase.from("stores").select("id, name").order("name"),
    ]);

    if (productsResult.error) {
      toast({ title: "Error loading products", description: productsResult.error.message, variant: "destructive" });
    } else {
      setProducts(productsResult.data || []);
    }

    if (storesResult.data) {
      setStores(storesResult.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function onSubmit(values: ProductValues) {
    setIsSubmitting(true);

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({
          store_id: values.store_id,
          name: values.name,
          description: values.description || null,
          price: values.price,
          inventory_count: values.inventory_count,
          image_url: values.image_url || null,
        })
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Error updating product", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product updated", description: "Your product has been updated." });
        fetchData();
        setIsDialogOpen(false);
        setEditingProduct(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("products").insert({
        store_id: values.store_id,
        name: values.name,
        description: values.description || null,
        price: values.price,
        inventory_count: values.inventory_count,
        image_url: values.image_url || null,
      });

      if (error) {
        toast({ title: "Error creating product", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product added!", description: "Your new product is ready." });
        fetchData();
        setIsDialogOpen(false);
        form.reset();
      }
    }

    setIsSubmitting(false);
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted", description: "The product has been removed." });
      fetchData();
    }
  }

  function openEditDialog(product: ProductData) {
    setEditingProduct(product);
    form.setValue("store_id", product.store_id);
    form.setValue("name", product.name);
    form.setValue("description", product.description || "");
    form.setValue("price", product.price);
    form.setValue("inventory_count", product.inventory_count);
    form.setValue("image_url", product.image_url);
    setIsDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingProduct(null);
      form.reset();
    }
    setIsDialogOpen(open);
  }

  const hasStores = stores.length > 0;

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage your product catalog across all stores.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="rounded-full" disabled={!hasStores}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update your product details." : "Add a new product to your store."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="store_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Amazing Product" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product..."
                            {...field}
                            className="rounded-xl resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inventory_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {!hasStores && (
          <Card className="bg-nest-warning/10 border-nest-warning/30 rounded-2xl">
            <CardContent className="py-6">
              <p className="text-center text-foreground">
                You need to create a store first before adding products.
              </p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-card/80 border-border/50 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                {hasStores
                  ? "Add your first product to start selling."
                  : "Create a store first, then add products."}
              </p>
              {hasStores && (
                <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-card/80 border-border/50 rounded-2xl hover:shadow-card transition-all group overflow-hidden">
                {product.image_url && (
                  <div className="aspect-video bg-secondary/50 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    {!product.image_url && (
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="font-display mt-4">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                      <DollarSign className="w-4 h-4" />
                      {product.price.toFixed(2)}
                    </div>
                    <Badge variant={product.inventory_count > 0 ? "default" : "destructive"} className="rounded-full">
                      {product.inventory_count} in stock
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Store: {product.stores?.name || "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
