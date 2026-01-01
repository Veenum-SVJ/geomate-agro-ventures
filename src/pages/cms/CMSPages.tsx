import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FileText } from 'lucide-react';

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
};

export default function CMSPages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const { data: pages, isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .order('slug', { ascending: true });
      if (error) throw error;
      return data as Page[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('website_pages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      const newEdited = { ...editedContent };
      delete newEdited[variables.id];
      setEditedContent(newEdited);
      toast({ title: 'Page content saved' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save page content', variant: 'destructive' });
    },
  });

  const handleContentChange = (pageId: string, content: string) => {
    setEditedContent({ ...editedContent, [pageId]: content });
  };

  const handleSave = (page: Page) => {
    const content = editedContent[page.id] ?? page.content ?? '';
    saveMutation.mutate({ id: page.id, content });
  };

  const hasChanges = (pageId: string) => {
    return editedContent[pageId] !== undefined;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pages</h1>
        <p className="text-muted-foreground mt-1">Edit content for static website pages</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {pages?.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{page.title}</CardTitle>
                      <CardDescription>/{page.slug}</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave(page)}
                    disabled={!hasChanges(page.id) || saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={10}
                  value={editedContent[page.id] ?? page.content ?? ''}
                  onChange={(e) => handleContentChange(page.id, e.target.value)}
                  placeholder="Enter page content..."
                  className="font-mono text-sm"
                />
                {hasChanges(page.id) && (
                  <p className="text-sm text-warning mt-2">You have unsaved changes</p>
                )}
              </CardContent>
            </Card>
          ))}

          {pages?.length === 0 && (
            <Card className="p-12">
              <CardContent className="flex flex-col items-center justify-center text-center p-0">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pages configured</h3>
                <p className="text-muted-foreground">
                  Pages will appear here once they are set up
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
