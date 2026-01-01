import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export function StorySection() {
  return (
    <section id="story-section" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <AnimatedSection direction="left" className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80"
                alt="Geomate farm landscape"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-card p-6 rounded-xl shadow-lg border border-border">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">10+</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Years of</p>
                  <p className="font-semibold text-foreground">Excellence</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Content Side */}
          <AnimatedSection direction="right" delay={0.2}>
            <span className="inline-block text-primary font-medium mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Rooted in Tradition,
              <br />
              Growing for Tomorrow
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Founded with a passion for sustainable agriculture, Geomate Agro
              Ventures has grown from a small family farm into one of Ibadan's
              most trusted agricultural enterprises.
            </p>
            <p className="text-muted-foreground mb-8">
              We believe in farming practices that nurture the land, care for our
              animals, and deliver the freshest products to our customers. Every
              seed we plant and every animal we raise reflects our commitment to
              quality and sustainability.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">
                Read Our Full Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
