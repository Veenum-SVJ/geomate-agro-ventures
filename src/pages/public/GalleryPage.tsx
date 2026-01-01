import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { X, ImageIcon } from 'lucide-react';

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  category: string | null;
};

// Fallback images when no CMS images exist
const fallbackImages = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop', alt_text: 'Farm landscape at sunrise', category: 'Farm' },
  { id: '2', image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop', alt_text: 'Free-range chickens', category: 'Poultry' },
  { id: '3', image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop', alt_text: 'Cattle grazing', category: 'Cattle' },
  { id: '4', image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop', alt_text: 'Fresh vegetables harvest', category: 'Crops' },
  { id: '5', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop', alt_text: 'Farm irrigation system', category: 'Farm' },
  { id: '6', image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop', alt_text: 'Fresh eggs collection', category: 'Poultry' },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

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

  // Use CMS images if available, otherwise use fallbacks
  const displayImages = images && images.length > 0 ? images : fallbackImages;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              Take a visual tour of Geomate Agro Ventures and see our farm operations in action.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : displayImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-end">
                    <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-medium text-background bg-primary px-2 py-1 rounded">
                        {image.category || 'Farm'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Gallery photos coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text || 'Gallery image'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent rounded-b-lg">
                <p className="text-background text-sm">{selectedImage.alt_text}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
