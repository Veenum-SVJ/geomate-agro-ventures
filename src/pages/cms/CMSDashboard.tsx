import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, Image, FileText, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

export default function CMSDashboard() {
  const { data: productsCount, isLoading: loadingProducts } = useQuery({
    queryKey: ['cms-products-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('website_products')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: galleryCount, isLoading: loadingGallery } = useQuery({
    queryKey: ['cms-gallery-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('gallery_images')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: inquiriesData, isLoading: loadingInquiries } = useQuery({
    queryKey: ['cms-inquiries-count'],
    queryFn: async () => {
      const { data } = await supabase.from('inquiries').select('status');
      const total = data?.length || 0;
      const unread = data?.filter((i) => i.status === 'unread').length || 0;
      return { total, unread };
    },
  });

  const stats = [
    {
      title: 'Total Products',
      value: productsCount,
      loading: loadingProducts,
      icon: Package,
      link: '/admin/cms/products',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Gallery Photos',
      value: galleryCount,
      loading: loadingGallery,
      icon: Image,
      link: '/admin/cms/gallery',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'New Inquiries',
      value: inquiriesData?.unread,
      loading: loadingInquiries,
      icon: MessageSquare,
      link: '/admin/cms/inquiries',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  const quickLinks = [
    { title: 'Manage Products', description: 'Add, edit, or remove products', link: '/admin/cms/products', icon: Package },
    { title: 'Gallery Management', description: 'Upload and organize photos', link: '/admin/cms/gallery', icon: Image },
    { title: 'Edit Pages', description: 'Update About Us and Practices content', link: '/admin/cms/pages', icon: FileText },
    { title: 'View Inquiries', description: 'Respond to customer messages', link: '/admin/cms/inquiries', icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Website CMS</h1>
        <p className="text-muted-foreground mt-1">
          Manage your Geomate Agro Ventures website content
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {stat.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <Link
                to={stat.link}
                className="text-sm text-primary hover:underline mt-4 inline-flex items-center"
              >
                View Details
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Button
                key={link.title}
                variant="outline"
                className="h-auto p-4 justify-start text-left"
                asChild
              >
                <Link to={link.link}>
                  <link.icon className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground font-normal">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Website Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">View Your Website</h3>
            <p className="text-sm text-muted-foreground">
              See how your changes look on the public website
            </p>
          </div>
          <Button asChild>
            <Link to="/" target="_blank">
              Open Website
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
