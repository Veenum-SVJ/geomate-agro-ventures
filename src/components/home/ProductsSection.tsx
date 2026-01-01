import { Link } from 'react-router-dom';
import { ArrowRight, Egg, Wheat, Beef } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { motion } from 'framer-motion';

const products = [
  {
    icon: Egg,
    title: 'Poultry',
    description:
      'Fresh eggs and quality poultry products from our free-range birds, raised with care.',
    image:
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop&q=80',
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Wheat,
    title: 'Crops',
    description:
      'Organically grown vegetables, grains, and seasonal produce harvested at peak freshness.',
    image:
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop&q=80',
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Beef,
    title: 'Cattle',
    description:
      'Premium beef and dairy products from our healthy, grass-fed cattle.',
    image:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop&q=80',
    color: 'from-rose-500/20 to-red-500/20',
  },
];

export function ProductsSection() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-medium mb-4">
            What We Grow
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From farm-fresh eggs to premium beef, we offer a carefully curated
            selection of quality agricultural products.
          </p>
        </AnimatedSection>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <AnimatedSection key={product.title} delay={index * 0.15}>
              <motion.div
                className="group relative bg-card rounded-2xl overflow-hidden border border-border h-full"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-60`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Icon */}
                  <div className="absolute bottom-4 left-4">
                    <div className="h-14 w-14 rounded-xl bg-primary shadow-lg flex items-center justify-center">
                      <product.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center text-primary font-medium group/link"
                  >
                    <span className="relative">
                      View Products
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
