import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, Droplets, Heart, Sun, Recycle, Shield, Sprout, ArrowRight, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Leaf, Droplets, Heart, Sun, Recycle, Shield, Sprout, Wind
};

export default function PracticesPage() {
  const { data: pageContent, isLoading: loadingPage } = useQuery({
    queryKey: ['public-page-practices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_pages')
        .select('content')
        .eq('slug', 'practices')
        .single();
      if (error) throw error;
      return data?.content;
    },
  });

  const { data: practices, isLoading: loadingPractices } = useQuery({
    queryKey: ['public-practices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_practices')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*');
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((s: any) => {
        map[s.key] = s.value;
      });
      return map;
    },
  });

  const practicesStats = settings?.practices_stats || [
    { number: '100%', label: 'Organic Fertilizers' },
    { number: '50%', label: 'Water Savings' },
    { number: 'Zero', label: 'Harmful Chemicals' },
    { number: '24/7', label: 'Animal Monitoring' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <Sprout className="h-4 w-4" />
              Sustainable Farming
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Our Farming Practices
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover the sustainable methods and ethical practices that define our approach to agriculture
            </p>
          </div>
        </motion.div>
      </section>

      {/* Intro */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {loadingPage ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6 mx-auto" />
                <Skeleton className="h-5 w-4/5 mx-auto" />
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl text-muted-foreground leading-relaxed"
              >
                {pageContent || `At Geomate Agro Ventures, sustainability isn't just a buzzword—it's how we do business. We believe that responsible farming practices lead to better products, healthier communities, and a thriving environment. Here's an overview of our commitment to sustainable agriculture.`}
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* Practices Grid - Visual Cards */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pillars of Sustainability
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our commitment to sustainable farming spans multiple areas
            </p>
          </motion.div>

          {loadingPractices ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practices?.map((practice: any, index: number) => {
                const IconComponent = iconMap[practice.icon] || Leaf;
                return (
                  <motion.div
                    key={practice.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-background rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${practice.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${practice.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {practice.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {practice.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detailed Accordion */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learn More
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dive deeper into each of our sustainable practices
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {practices?.map((practice: any, index: number) => {
                const IconComponent = iconMap[practice.icon] || Leaf;
                return (
                  <motion.div
                    key={practice.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem 
                      value={`item-${index}`}
                      className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg transition-all"
                    >
                      <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${practice.bg_color} flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-lg font-semibold text-foreground text-left">
                            {practice.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="pl-14 text-muted-foreground whitespace-pre-line leading-relaxed">
                          {practice.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {practicesStats.map((stat: any, index: number) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                backgroundImage: 'url(https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920&h=600&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div className="relative z-10 py-20 px-8 md:px-16 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                See Our Practices in Action
              </h2>
              <p className="text-muted-foreground mb-8">
                We welcome visitors who want to experience our sustainable farming methods firsthand. 
                Schedule a tour and see how we're making a difference.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Schedule a Farm Visit
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
