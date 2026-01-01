import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart, Users } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We never compromise on the quality of our products, ensuring only the best reaches our customers.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'We believe in open communication and honest practices with all our stakeholders.',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Our farming methods prioritize environmental health and long-term sustainability.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We are committed to supporting local communities and contributing to their growth.',
  },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Geomate Agro Ventures
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn about our journey, our mission, and the values that drive everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=500&fit=crop"
                alt="Farm founders"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Geomate Agro Ventures was founded in Ibadan, Nigeria, with a simple but powerful vision: 
                to bridge the gap between sustainable farming practices and the growing demand for 
                high-quality agricultural products.
              </p>
              <p className="text-muted-foreground mb-4">
                What started as a small family operation has grown into a thriving agricultural 
                enterprise. Over the years, we have invested in modern farming techniques while 
                staying true to traditional values of hard work, integrity, and respect for the land.
              </p>
              <p className="text-muted-foreground">
                Today, we serve both local consumers and business partners across Nigeria, 
                providing fresh poultry products, organically grown crops, and premium cattle 
                products—all produced with care and commitment to excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide high-quality, sustainably produced agricultural products that meet 
                  the needs of our customers while promoting environmental stewardship and 
                  supporting local communities. We strive to be a trusted partner for individuals 
                  and businesses seeking reliable, fresh, and ethically sourced farm products.
                </p>
              </CardContent>
            </Card>
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become Nigeria's leading sustainable agriculture enterprise, recognized for 
                  innovation, quality, and positive impact on both people and the planet. We 
                  envision a future where modern farming practices and traditional wisdom come 
                  together to create a more food-secure nation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make and every product we deliver.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="p-6 text-center hover:shadow-lg transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-muted-foreground">
              Behind Geomate Agro Ventures is a dedicated team of agricultural experts, 
              farm workers, and support staff who share a passion for sustainable farming 
              and delivering the best to our customers. Together, we work tirelessly to 
              ensure that every product meets our high standards of quality.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
