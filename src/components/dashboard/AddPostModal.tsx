
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
        title: "Post saved successfully! 🎉",
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
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-spotify-glow">Add New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="post_url" className="text-sm font-medium">LinkedIn Post URL *</Label>
            <Input
              id="post_url"
              type="url"
              value={formData.post_url}
              onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
              placeholder="https://linkedin.com/posts/..."
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="author_name" className="text-sm font-medium">Author Name</Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">Post Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief title for the post"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">Post Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Paste the LinkedIn post content here..."
              className="mt-1"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="glass" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="spotify" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
