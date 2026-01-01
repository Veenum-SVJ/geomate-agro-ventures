import { Leaf, Droplets, Heart, Award } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

const features = [
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    description:
      'Eco-friendly farming methods that protect and nurture the environment for future generations.',
  },
  {
    icon: Droplets,
    title: 'Water Conservation',
    description:
      'Advanced irrigation systems and rainwater harvesting that minimize waste.',
  },
  {
    icon: Heart,
    title: 'Animal Welfare',
    description:
      'Ethical treatment ensuring our livestock live healthy, stress-free lives.',
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description:
      'Rigorous quality control from farm to table, guaranteeing freshness.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <AnimatedSection>
            <span className="inline-block text-primary font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Committed to
              <br />
              <span className="text-primary">Quality & Sustainability</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              At Geomate Agro, we don't just grow food — we grow with purpose.
              Our practices ensure that every product meets the highest standards
              while respecting our planet.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <AnimatedSection
                  key={feature.title}
                  delay={0.1 + index * 0.1}
                  direction="up"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>

          {/* Image Grid */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=400&fit=crop&q=80"
                    alt="Fresh vegetables"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop&q=80"
                    alt="Farm field"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80"
                    alt="Sunrise over farm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=400&fit=crop&q=80"
                    alt="Happy cattle"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
