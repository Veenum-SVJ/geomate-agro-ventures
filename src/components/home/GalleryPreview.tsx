import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { motion } from 'framer-motion';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop&q=80',
    alt: 'Rice paddy field',
  },
  {
    src: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600&h=400&fit=crop&q=80',
    alt: 'Mountain farm view',
  },
  {
    src: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&h=400&fit=crop&q=80',
    alt: 'Fresh harvest',
  },
  {
    src: 'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=600&h=400&fit=crop&q=80',
    alt: 'Chickens in the field',
  },
];

export function GalleryPreview() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-primary font-medium mb-4">
            Farm Life
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            A Glimpse of Our Farm
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Experience the beauty of sustainable farming through our lens.
          </p>
        </AnimatedSection>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {galleryImages.map((image, index) => (
            <AnimatedSection key={image.alt} delay={index * 0.1}>
              <motion.div
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors duration-300" />
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
