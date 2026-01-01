import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight, Egg, Fish, Wheat, BarChart3, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Egg,
    title: 'Poultry Management',
    description: 'Track egg production, mortality, feed consumption, and sales with detailed P/L analysis.',
  },
  {
    icon: Fish,
    title: 'Fishery Operations',
    description: 'Monitor pond production, stocking, water quality, and harvest records for optimal yields.',
  },
  {
    icon: Wheat,
    title: 'Crop Conservation',
    description: 'Log planting activities, fertilizer usage, irrigation, and track seasonal crop yields.',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Reports',
    description: 'Get automated insights and financial analysis with our intelligent reporting system.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Coordinate workers, assign tasks, and manage payroll all in one place.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your farm data is protected with enterprise-grade security and role-based access.',
  },
];

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <nav className="relative container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FarmFlow NG</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="default">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Manage Your Farm
              <span className="text-primary"> Smarter</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              FarmFlow NG is the complete digital platform for Nigerian farmers. 
              Track operations, analyze profits, and grow your farm with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Run Your Farm
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From daily operations to financial analysis, FarmFlow NG provides all the tools 
              you need to transform your farm management.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-primary/5 rounded-2xl p-12 border border-primary/10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of Nigerian farmers who are already using FarmFlow NG 
              to increase efficiency and boost profits.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">FarmFlow NG</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FarmFlow NG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
