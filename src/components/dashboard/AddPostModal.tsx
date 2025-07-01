
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPostModal = ({ isOpen, onClose, onSuccess }: AddPostModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author_name: '',
    post_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          ...formData,
          user_id: user.id,
          saved_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Post saved successfully!",
        description: "Your LinkedIn post has been added to your collection.",
      });

      setFormData({ title: '', content: '', author_name: '', post_url: '' });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="post_url">LinkedIn Post URL *</Label>
            <Input
              id="post_url"
              type="url"
              value={formData.post_url}
              onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
              placeholder="https://linkedin.com/posts/..."
              required
            />
          </div>

          <div>
            <Label htmlFor="author_name">Author Name</Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="title">Post Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief title for the post"
            />
          </div>

          <div>
            <Label htmlFor="content">Post Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Paste the LinkedIn post content here..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
