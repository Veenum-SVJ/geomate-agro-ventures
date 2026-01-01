import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { X, ImageIcon, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  category: string | null;
};

const fallbackImages: GalleryImage[] = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop', alt_text: 'Farm landscape at sunrise', category: 'Farm' },
  { id: '2', image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop', alt_text: 'Free-range chickens', category: 'Poultry' },
  { id: '3', image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop', alt_text: 'Cattle grazing', category: 'Cattle' },
  { id: '4', image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop', alt_text: 'Fresh vegetables harvest', category: 'Crops' },
  { id: '5', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop', alt_text: 'Farm irrigation system', category: 'Farm' },
  { id: '6', image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop', alt_text: 'Fresh eggs collection', category: 'Poultry' },
  { id: '7', image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop', alt_text: 'Grain harvest', category: 'Crops' },
  { id: '8', image_url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=600&fit=crop', alt_text: 'Farm workers', category: 'Farm' },
];

export default function GalleryPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const displayImages = images && images.length > 0 ? images : fallbackImages;
  const categories = [...new Set(displayImages.map(img => img.category).filter(Boolean))];
  const filteredImages = activeFilter 
    ? displayImages.filter(img => img.category === activeFilter)
    : displayImages;

  const selectedImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : filteredImages.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < filteredImages.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

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
            <Camera className="h-4 w-4" />
            Visual Journey
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Our Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A visual tour of Geomate Agro Ventures - see our farm operations in action
          </p>
        </motion.div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Photos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="rounded-xl break-inside-avoid"
                  style={{ height: `${Math.random() * 150 + 200}px` }} 
                />
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <motion.div 
              layout
              className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="break-inside-avoid"
                  >
                    <div
                      className="group relative overflow-hidden rounded-xl cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Gallery image'}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/0 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-primary/90 text-xs font-medium text-primary-foreground">
                            {image.category || 'Farm'}
                          </span>
                          {image.alt_text && (
                            <p className="mt-2 text-sm text-white line-clamp-2">{image.alt_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No photos yet</h3>
              <p className="text-muted-foreground">Gallery photos coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-none">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Navigation buttons */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>

          {selectedImage && (
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text || 'Gallery image'}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <div className="p-6 bg-gradient-to-t from-background to-transparent">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {selectedImage.category || 'Farm'}
                  </span>
                  {selectedImage.alt_text && (
                    <p className="text-foreground">{selectedImage.alt_text}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedImageIndex !== null && `${selectedImageIndex + 1} of ${filteredImages.length}`}
                </p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Want to See More?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Schedule a farm visit and experience our operations firsthand
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Schedule a Visit
              <span>→</span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
