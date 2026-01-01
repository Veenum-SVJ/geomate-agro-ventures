import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Egg, Wheat, Beef } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  stock_status: string;
};

const stockStatusColors: Record<string, string> = {
  in_stock: 'bg-success text-success-foreground',
  low_stock: 'bg-warning text-warning-foreground',
  out_of_stock: 'bg-destructive text-destructive-foreground',
};

const stockStatusLabels: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

const categoryImages: Record<string, string> = {
  poultry: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
  crops: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
  cattle: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop',
};

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('poultry');

  const { data: products, isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const productsByCategory = {
    poultry: products?.filter((p) => p.category === 'poultry') || [],
    crops: products?.filter((p) => p.category === 'crops') || [],
    cattle: products?.filter((p) => p.category === 'cattle') || [],
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our range of fresh, quality agricultural products grown and raised with care.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="poultry" className="flex items-center gap-2">
                <Egg className="h-4 w-4" />
                <span className="hidden sm:inline">Poultry</span>
              </TabsTrigger>
              <TabsTrigger value="crops" className="flex items-center gap-2">
                <Wheat className="h-4 w-4" />
                <span className="hidden sm:inline">Crops</span>
              </TabsTrigger>
              <TabsTrigger value="cattle" className="flex items-center gap-2">
                <Beef className="h-4 w-4" />
                <span className="hidden sm:inline">Cattle</span>
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              Object.entries(productsByCategory).map(([category, items]) => (
                <TabsContent key={category} value={category}>
                  {items.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {items.map((product, index) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="relative h-48">
                            <img
                              src={product.image_url || categoryImages[category]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <Badge className={`absolute top-3 right-3 ${stockStatusColors[product.stock_status]}`}>
                              {stockStatusLabels[product.stock_status]}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No products available in this category yet.
                    </div>
                  )}
                </TabsContent>
              ))
            )}
          </Tabs>

          {/* Bulk Orders */}
          <div className="mt-16 text-center p-8 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Looking for Bulk Orders?
            </h3>
            <p className="text-muted-foreground mb-4">
              We offer competitive pricing for restaurants, retailers, and distributors.
              Contact us to discuss your requirements.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              Get in Touch →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
