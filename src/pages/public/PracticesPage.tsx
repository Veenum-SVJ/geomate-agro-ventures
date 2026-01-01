import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Droplets, Heart, Sun, Recycle, Shield } from 'lucide-react';

const practices = [
  {
    icon: Leaf,
    title: 'Soil Health Management',
    description: 'Our approach to maintaining healthy, productive soil.',
    content: `At Geomate Agro Ventures, we understand that healthy soil is the foundation of sustainable 
    agriculture. We employ several practices to maintain and improve soil health:
    
    • Crop rotation to prevent nutrient depletion
    • Cover cropping during off-seasons
    • Minimal tillage to preserve soil structure
    • Regular soil testing and targeted nutrient application
    • Use of organic matter and compost to enhance fertility
    
    These practices ensure that our soil remains productive for generations to come while reducing 
    our environmental footprint.`,
  },
  {
    icon: Droplets,
    title: 'Water Conservation',
    description: 'Efficient water use through modern irrigation systems.',
    content: `Water is a precious resource, and we take its conservation seriously. Our water management 
    strategies include:
    
    • Drip irrigation systems that deliver water directly to plant roots
    • Rainwater harvesting and storage facilities
    • Scheduling irrigation based on weather data and soil moisture levels
    • Mulching to reduce evaporation
    • Regular maintenance of irrigation equipment to prevent leaks
    
    Through these methods, we significantly reduce water waste while ensuring our crops and 
    animals receive the hydration they need.`,
  },
  {
    icon: Heart,
    title: 'Animal Welfare',
    description: 'Ethical treatment and care for all our livestock.',
    content: `We believe that happy, healthy animals produce the best products. Our animal welfare 
    standards include:
    
    • Spacious, clean housing for all livestock
    • Access to outdoor areas and natural light
    • Balanced, nutritious diets without unnecessary antibiotics
    • Regular veterinary check-ups and preventive care
    • Humane handling practices at all times
    
    Our commitment to animal welfare is not just ethical—it results in healthier animals and 
    higher quality products for our customers.`,
  },
  {
    icon: Sun,
    title: 'Sustainable Energy',
    description: 'Utilizing renewable energy sources on the farm.',
    content: `We are working towards reducing our carbon footprint through sustainable energy 
    practices:
    
    • Solar panels for powering farm equipment and facilities
    • Energy-efficient lighting and cooling systems
    • Biogas production from farm waste
    • Natural ventilation in animal housing where possible
    
    These initiatives help reduce our operating costs while contributing to a cleaner 
    environment for our community.`,
  },
  {
    icon: Recycle,
    title: 'Waste Management',
    description: 'Converting farm waste into valuable resources.',
    content: `Nothing goes to waste at Geomate Agro Ventures. Our waste management approach 
    includes:
    
    • Composting plant materials and manure for use as organic fertilizer
    • Biogas production from organic waste
    • Recycling packaging materials
    • Proper disposal of any non-recyclable waste
    
    By turning waste into resources, we close the loop and create a more sustainable 
    farming operation.`,
  },
  {
    icon: Shield,
    title: 'Integrated Pest Management',
    description: 'Minimizing chemical use through natural pest control.',
    content: `We prioritize natural pest control methods to protect both our crops and the 
    environment:
    
    • Introduction of beneficial insects that prey on pests
    • Companion planting to deter harmful insects
    • Regular crop monitoring to catch infestations early
    • Use of biological pesticides when intervention is needed
    • Chemical pesticides only as a last resort and in minimal quantities
    
    This approach protects our ecosystem while producing healthier, safer food for 
    our customers.`,
  },
];

export default function PracticesPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Farming Practices
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn about the sustainable methods and ethical practices that define our approach to agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground text-lg">
              At Geomate Agro Ventures, sustainability isn't just a buzzword—it's how we do 
              business. We believe that responsible farming practices lead to better products, 
              healthier communities, and a thriving environment. Here's an overview of our 
              commitment to sustainable agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* Practices Grid */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {practices.map((practice, index) => (
              <Card
                key={practice.title}
                className="p-6 hover:shadow-lg transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-0">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <practice.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{practice.title}</h3>
                  <p className="text-sm text-muted-foreground">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Accordion */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Learn More About Our Practices
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {practices.map((practice, index) => (
                <AccordionItem key={practice.title} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <practice.icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{practice.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {practice.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Want to Visit Our Farm?
            </h3>
            <p className="text-muted-foreground mb-6">
              We welcome visitors who want to see our sustainable practices in action. 
              Contact us to schedule a farm tour.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              Schedule a Visit →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
