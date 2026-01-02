import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Egg, Wheat, Beef, ArrowRight, Package, Fish, Milk, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  stock_status: string;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  color: string;
  icon: string;
};

const iconMap: Record<string, LucideIcon> = {
  Egg, Wheat, Beef, Fish, Milk, Apple, Package
};

const stockStatusConfig: Record<string, { color: string; label: string }> = {
  in_stock: { color: 'bg-success text-success-foreground', label: 'In Stock' },
  low_stock: { color: 'bg-warning text-warning-foreground', label: 'Low Stock' },
  out_of_stock: { color: 'bg-destructive text-destructive-foreground', label: 'Out of Stock' },
};

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
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

  const activeCategoryData = activeCategory ? categories?.find(c => c.slug === activeCategory) : null;
  const filteredProducts = activeCategory 
    ? products?.filter((p) => p.category === activeCategory) || []
    : [];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Package className="h-4 w-4" />
            Fresh from the Farm
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Our Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quality agricultural products grown and raised with care, delivered fresh to your table
          </p>
        </motion.div>
      </section>

      {/* Category Selector - Large Cards */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          {loadingCategories ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {categories?.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Package;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveCategory(activeCategory === category.slug ? null : category.slug)}
                    className={`group relative overflow-hidden rounded-2xl aspect-[4/3] text-left transition-all duration-500 ${
                      activeCategory === category.slug ? 'ring-4 ring-primary ring-offset-4 ring-offset-background' : ''
                    }`}
                  >
                    <img
                      src={category.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70 group-hover:opacity-80 transition-opacity`} />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                      </div>
                      <p className="text-white/80">{category.description}</p>
                      <div className="flex items-center gap-2 mt-4 text-white font-medium">
                        <span>View Products</span>
                        <ArrowRight className={`h-4 w-4 transition-transform ${activeCategory === category.slug ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid - Expands under selected category */}
      <AnimatePresence>
        {activeCategory && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden"
          >
            <div className="container mx-auto px-4 py-12">
              <div className="flex items-center gap-4 mb-8">
                {activeCategoryData && (
                  <>
                    {(() => {
                      const IconComponent = iconMap[activeCategoryData.icon] || Package;
                      return (
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeCategoryData.color} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                      );
                    })()}
                    <h2 className="text-2xl font-bold text-foreground">{activeCategoryData.name} Products</h2>
                  </>
                )}
              </div>

              {loadingProducts ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={product.image_url || activeCategoryData?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className={`absolute top-3 right-3 ${stockStatusConfig[product.stock_status]?.color}`}>
                          {stockStatusConfig[product.stock_status]?.label}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/50 rounded-2xl">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No products available in this category yet.</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bulk Orders CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&h=600&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Looking for Bulk Orders?
              </h2>
              <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8">
                We offer competitive pricing for restaurants, retailers, and distributors.
                Contact us to discuss your requirements.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-foreground font-semibold hover:bg-background/90 transition-colors shadow-lg"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quality Promise */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Farm Fresh', description: 'Products delivered within 24 hours of harvest or production' },
              { title: 'Quality Assured', description: 'Rigorous quality checks at every stage of production' },
              { title: 'Sustainably Sourced', description: 'Environmentally responsible farming practices' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
