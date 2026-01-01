import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, Droplets, Heart, Sun, Recycle, Shield, Sprout, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const practices = [
  {
    icon: Leaf,
    title: 'Soil Health Management',
    description: 'Our approach to maintaining healthy, productive soil.',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    content: `At Geomate Agro Ventures, we understand that healthy soil is the foundation of sustainable agriculture. We employ several practices to maintain and improve soil health:
    
• Crop rotation to prevent nutrient depletion
• Cover cropping during off-seasons
• Minimal tillage to preserve soil structure
• Regular soil testing and targeted nutrient application
• Use of organic matter and compost to enhance fertility

These practices ensure that our soil remains productive for generations to come while reducing our environmental footprint.`,
  },
  {
    icon: Droplets,
    title: 'Water Conservation',
    description: 'Efficient water use through modern irrigation systems.',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    content: `Water is a precious resource, and we take its conservation seriously. Our water management strategies include:
    
• Drip irrigation systems that deliver water directly to plant roots
• Rainwater harvesting and storage facilities
• Scheduling irrigation based on weather data and soil moisture levels
• Mulching to reduce evaporation
• Regular maintenance of irrigation equipment to prevent leaks

Through these methods, we significantly reduce water waste while ensuring our crops and animals receive the hydration they need.`,
  },
  {
    icon: Heart,
    title: 'Animal Welfare',
    description: 'Ethical treatment and care for all our livestock.',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10',
    content: `We believe that happy, healthy animals produce the best products. Our animal welfare standards include:
    
• Spacious, clean housing for all livestock
• Access to outdoor areas and natural light
• Balanced, nutritious diets without unnecessary antibiotics
• Regular veterinary check-ups and preventive care
• Humane handling practices at all times

Our commitment to animal welfare is not just ethical—it results in healthier animals and higher quality products for our customers.`,
  },
  {
    icon: Sun,
    title: 'Sustainable Energy',
    description: 'Utilizing renewable energy sources on the farm.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    content: `We are working towards reducing our carbon footprint through sustainable energy practices:
    
• Solar panels for powering farm equipment and facilities
• Energy-efficient lighting and cooling systems
• Biogas production from farm waste
• Natural ventilation in animal housing where possible

These initiatives help reduce our operating costs while contributing to a cleaner environment for our community.`,
  },
  {
    icon: Recycle,
    title: 'Waste Management',
    description: 'Converting farm waste into valuable resources.',
    color: 'from-teal-500 to-green-600',
    bgColor: 'bg-teal-500/10',
    content: `Nothing goes to waste at Geomate Agro Ventures. Our waste management approach includes:
    
• Composting plant materials and manure for use as organic fertilizer
• Biogas production from organic waste
• Recycling packaging materials
• Proper disposal of any non-recyclable waste

By turning waste into resources, we close the loop and create a more sustainable farming operation.`,
  },
  {
    icon: Shield,
    title: 'Integrated Pest Management',
    description: 'Minimizing chemical use through natural pest control.',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-500/10',
    content: `We prioritize natural pest control methods to protect both our crops and the environment:
    
• Introduction of beneficial insects that prey on pests
• Companion planting to deter harmful insects
• Regular crop monitoring to catch infestations early
• Use of biological pesticides when intervention is needed
• Chemical pesticides only as a last resort and in minimal quantities

This approach protects our ecosystem while producing healthier, safer food for our customers.`,
  },
];

export default function PracticesPage() {
  const { data: pageContent, isLoading } = useQuery({
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
            {isLoading ? (
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
              Six Pillars of Sustainability
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our commitment to sustainable farming spans multiple areas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice, index) => (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-background rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${practice.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${practice.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <practice.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {practice.title}
                </h3>
                <p className="text-muted-foreground">
                  {practice.description}
                </p>
              </motion.div>
            ))}
          </div>
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
              {practices.map((practice, index) => (
                <motion.div
                  key={practice.title}
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
                        <div className={`w-10 h-10 rounded-lg ${practice.bgColor} flex items-center justify-center`}>
                          <practice.icon className="h-5 w-5 text-primary" />
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
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '100%', label: 'Organic Fertilizers' },
              { number: '50%', label: 'Water Savings' },
              { number: '0', label: 'Growth Hormones' },
              { number: '24/7', label: 'Animal Care' },
            ].map((stat, index) => (
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
