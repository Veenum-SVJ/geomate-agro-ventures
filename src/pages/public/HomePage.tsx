import { HeroSection } from '@/components/home/HeroSection';
import { StorySection } from '@/components/home/StorySection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { GalleryPreview } from '@/components/home/GalleryPreview';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <StorySection />
      <ProductsSection />
      <FeaturesSection />
      <GalleryPreview />
      <CTASection />
    </div>
  );
}
