import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    alt: 'Farm landscape at sunrise',
    category: 'Farm',
  },
  {
    src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop',
    alt: 'Free-range chickens',
    category: 'Poultry',
  },
  {
    src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop',
    alt: 'Cattle grazing',
    category: 'Cattle',
  },
  {
    src: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
    alt: 'Fresh vegetables harvest',
    category: 'Crops',
  },
  {
    src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    alt: 'Farm irrigation system',
    category: 'Farm',
  },
  {
    src: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop',
    alt: 'Fresh eggs collection',
    category: 'Poultry',
  },
  {
    src: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=600&fit=crop',
    alt: 'Maize field',
    category: 'Crops',
  },
  {
    src: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop',
    alt: 'Farm workers',
    category: 'Farm',
  },
  {
    src: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    alt: 'Goats on the farm',
    category: 'Cattle',
  },
  {
    src: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop',
    alt: 'Fresh milk processing',
    category: 'Cattle',
  },
  {
    src: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=800&h=600&fit=crop',
    alt: 'Turkey farming',
    category: 'Poultry',
  },
  {
    src: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800&h=600&fit=crop',
    alt: 'Yam harvest',
    category: 'Crops',
  },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-end">
                  <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-medium text-background bg-primary px-2 py-1 rounded">
                      {image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent rounded-b-lg">
                <p className="text-background text-sm">{selectedImage.alt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
