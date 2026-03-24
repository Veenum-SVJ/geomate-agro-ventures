import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CTASection() {
  // Fetch contact settings from database
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

  const contact = settings?.contact || {
    phone: '+234 801 234 5678',
    email: 'info@geomateagro.com',
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=800&fit=crop&q=80"
          alt="Farm sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/85 to-primary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Experience
              <br />
              Farm-Fresh Quality?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
              Whether you're a local consumer looking for fresh produce or a
              business seeking reliable suppliers, we'd love to hear from you.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8"
                asChild
              >
                <Link to="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          </AnimatedSection>

          {/* Contact Info - Now Dynamic */}
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-foreground/80">
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
              <span className="hidden sm:inline text-primary-foreground/40">|</span>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
