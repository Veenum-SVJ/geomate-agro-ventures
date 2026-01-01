import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Egg, Wheat, Beef } from 'lucide-react';

const products = {
  poultry: [
    {
      name: 'Fresh Eggs',
      description: 'Farm-fresh eggs from our free-range chickens. Rich in nutrients and flavor.',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Whole Chicken',
      description: 'Healthy, antibiotic-free whole chickens ready for your table.',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Turkey',
      description: 'Premium turkeys perfect for special occasions and family gatherings.',
      image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=300&fit=crop',
      status: 'Low Stock',
    },
    {
      name: 'Broiler Chicken',
      description: 'Tender broiler chickens raised with care for optimal quality.',
      image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
  ],
  crops: [
    {
      name: 'Maize',
      description: 'Quality maize grains for consumption and animal feed.',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Cassava',
      description: 'Fresh cassava tubers, a staple food crop with multiple uses.',
      image: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Vegetables',
      description: 'Seasonal vegetables including tomatoes, peppers, and leafy greens.',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Yam',
      description: 'Premium quality yam tubers from our farm.',
      image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&h=300&fit=crop',
      status: 'Low Stock',
    },
  ],
  cattle: [
    {
      name: 'Fresh Beef',
      description: 'Premium grass-fed beef, tender and full of flavor.',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Fresh Milk',
      description: 'Pure, unpasteurized milk from healthy dairy cows.',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Goat Meat',
      description: 'Quality goat meat for traditional dishes and special meals.',
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
      status: 'In Stock',
    },
    {
      name: 'Live Cattle',
      description: 'Healthy cattle available for purchase. Contact us for bulk orders.',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop',
      status: 'Available',
    },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Stock':
    case 'Available':
      return 'bg-success text-success-foreground';
    case 'Low Stock':
      return 'bg-warning text-warning-foreground';
    case 'Out of Stock':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('poultry');

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our range of fresh, quality agricultural products grown and raised with care.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="poultry" className="flex items-center gap-2">
                <Egg className="h-4 w-4" />
                <span className="hidden sm:inline">Poultry</span>
              </TabsTrigger>
              <TabsTrigger value="crops" className="flex items-center gap-2">
                <Wheat className="h-4 w-4" />
                <span className="hidden sm:inline">Crops</span>
              </TabsTrigger>
              <TabsTrigger value="cattle" className="flex items-center gap-2">
                <Beef className="h-4 w-4" />
                <span className="hidden sm:inline">Cattle</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(products).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map((product, index) => (
                    <Card
                      key={product.name}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-48">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className={`absolute top-3 right-3 ${getStatusColor(product.status)}`}>
                          {product.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Bulk Orders */}
          <div className="mt-16 text-center p-8 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Looking for Bulk Orders?
            </h3>
            <p className="text-muted-foreground mb-4">
              We offer competitive pricing for restaurants, retailers, and distributors.
              Contact us to discuss your requirements.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              Get in Touch →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
