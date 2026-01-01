import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Eye, Heart, Users, Award, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We never compromise on the quality of our products, ensuring only the best reaches our customers.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'We believe in open communication and honest practices with all our stakeholders.',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Our farming methods prioritize environmental health and long-term sustainability.',
    color: 'from-green-600 to-emerald-700',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We are committed to supporting local communities and contributing to their growth.',
    color: 'from-stone-500 to-stone-700',
  },
];

const milestones = [
  { year: '2015', title: 'The Beginning', description: 'Started as a small family poultry farm in Ibadan' },
  { year: '2017', title: 'Expansion', description: 'Added crop cultivation and expanded to 50 hectares' },
  { year: '2019', title: 'Cattle Division', description: 'Introduced cattle rearing and dairy production' },
  { year: '2022', title: 'Modernization', description: 'Implemented sustainable practices and modern equipment' },
  { year: '2024', title: 'Today', description: 'Serving thousands of customers across Nigeria' },
];

const stats = [
  { number: '500+', label: 'Hectares of Farmland' },
  { number: '10K+', label: 'Happy Customers' },
  { number: '50+', label: 'Team Members' },
  { number: '9+', label: 'Years of Excellence' },
];

const defaultContent = `Geomate Agro Ventures was founded in Ibadan, Nigeria, with a simple but powerful vision: to bridge the gap between sustainable farming practices and the growing demand for high-quality agricultural products.

What started as a small family operation has grown into a thriving agricultural enterprise. Over the years, we have invested in modern farming techniques while staying true to traditional values of hard work, integrity, and respect for the land.

Today, we serve both local consumers and business partners across Nigeria, providing fresh poultry products, organically grown crops, and premium cattle products—all produced with care and commitment to excellence.`;

export default function AboutPage() {
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ['public-page-about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_pages')
        .select('content')
        .eq('slug', 'about')
        .single();
      if (error) throw error;
      return data?.content || defaultContent;
    },
  });

  const content = pageContent || defaultContent;

  return (
    <div className="overflow-hidden">
      {/* Hero - Full-screen with parallax */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
            <Sprout className="h-4 w-4" />
            Our Journey
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            About Geomate
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From humble beginnings to becoming a trusted name in Nigerian agriculture
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.number}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section - Asymmetric layout */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=750&fit=crop"
                  alt="Farm founders"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating award badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-accent flex items-center justify-center shadow-xl"
              >
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto text-accent-foreground" />
                  <span className="text-xs font-semibold text-accent-foreground">Est. 2015</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 space-y-6"
            >
              <h2 className="text-4xl font-bold text-foreground">Our Story</h2>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="text-lg text-muted-foreground space-y-4 whitespace-pre-line leading-relaxed">
                  {content}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From a small family farm to a thriving agricultural enterprise
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border inline-block">
                      <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-foreground mt-1">{milestone.title}</h3>
                      <p className="text-muted-foreground mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Cards with gradient backgrounds */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <Target className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide high-quality, sustainably produced agricultural products that meet 
                the needs of our customers while promoting environmental stewardship and 
                supporting local communities. We strive to be a trusted partner for individuals 
                and businesses seeking reliable, fresh, and ethically sourced farm products.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              <Eye className="h-12 w-12 text-accent-foreground mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Nigeria's leading sustainable agriculture enterprise, recognized for 
                innovation, quality, and positive impact on both people and the planet. We 
                envision a future where modern farming practices and traditional wisdom come 
                together to create a more food-secure nation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values - Horizontal scroll on mobile */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These principles guide every decision we make
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-background rounded-2xl p-6 shadow-sm border border-border overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <value.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
            <div className="relative z-10 py-16 px-8 md:px-16 max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground mb-8">
                Behind Geomate Agro Ventures is a dedicated team of agricultural experts, 
                farm workers, and support staff who share a passion for sustainable farming 
                and delivering the best to our customers.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Get in Touch
                <span>→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
