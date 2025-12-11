-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create policy for authenticated users to upload product images
CREATE POLICY "Users can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Create policy for anyone to view product images (public storefront)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Create policy for users to update their own product images
CREATE POLICY "Users can update their product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Create policy for users to delete their product images
CREATE POLICY "Users can delete their product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Add slug column to stores for public URLs
ALTER TABLE public.stores ADD COLUMN slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_stores_slug ON public.stores(slug);

-- Update RLS to allow public access to stores by slug
CREATE POLICY "Anyone can view stores by slug"
ON public.stores
FOR SELECT
USING (slug IS NOT NULL);

-- Allow public access to products of public stores
CREATE POLICY "Anyone can view products of public stores"
ON public.products
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores
  WHERE stores.id = products.store_id
  AND stores.slug IS NOT NULL
));

-- Allow public access to categories of public stores
CREATE POLICY "Anyone can view categories of public stores"
ON public.categories
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores
  WHERE stores.id = categories.store_id
  AND stores.slug IS NOT NULL
));