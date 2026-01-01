import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";

// Public pages
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ProductsPage from "./pages/public/ProductsPage";
import GalleryPage from "./pages/public/GalleryPage";
import PracticesPage from "./pages/public/PracticesPage";
import ContactPage from "./pages/public/ContactPage";

// Auth
import Auth from "./pages/Auth";

// Admin pages
import Dashboard from "./pages/Dashboard";
import Poultry from "./pages/Poultry";
import Fishery from "./pages/Fishery";
import Crops from "./pages/Crops";
import Feedmill from "./pages/Feedmill";
import Tasks from "./pages/Tasks";
import Workers from "./pages/Workers";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/practices" element={<PracticesPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth */}
            <Route path="/admin" element={<Auth />} />

            {/* Admin CMS (FarmFlow) */}
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/poultry" element={<Poultry />} />
              <Route path="/admin/fishery" element={<Fishery />} />
              <Route path="/admin/crops" element={<Crops />} />
              <Route path="/admin/feedmill" element={<Feedmill />} />
              <Route path="/admin/tasks" element={<Tasks />} />
              <Route path="/admin/workers" element={<Workers />} />
              <Route path="/admin/customers" element={<Customers />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
