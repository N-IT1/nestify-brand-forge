import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/dashboard/Stores";
import Products from "./pages/dashboard/Products";
import Categories from "./pages/dashboard/Categories";
import Settings from "./pages/dashboard/Settings";
import Analytics from "./pages/dashboard/Analytics";
import Orders from "./pages/dashboard/Orders";
import Customers from "./pages/dashboard/Customers";
import Discounts from "./pages/dashboard/Discounts";
import Marketing from "./pages/dashboard/Marketing";
import Help from "./pages/dashboard/Help";
import Storefront from "./pages/Storefront";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/stores" element={<Stores />} />
            <Route path="/dashboard/products" element={<Products />} />
            <Route path="/dashboard/categories" element={<Categories />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/customers" element={<Customers />} />
            <Route path="/dashboard/discounts" element={<Discounts />} />
            <Route path="/dashboard/marketing" element={<Marketing />} />
            <Route path="/dashboard/help" element={<Help />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/store/:slug" element={<Storefront />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
