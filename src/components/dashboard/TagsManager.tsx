
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TagData {
  id: string;
  name: string;
  color: string;
  description: string;
  is_system: boolean;
}

export const TagsManager = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
  });

  const { data: tags, isLoading, refetch } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const resetForm = () => {
    setFormData({ name: '', color: '#3B82F6', description: '' });
    setEditingTag(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTag) {
        const { error } = await supabase
          .from('tags')
          .update(formData)
          .eq('id', editingTag.id);

        if (error) throw error;

        toast({
          title: "Tag updated successfully!",
          description: "The tag has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('tags')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Tag created successfully!",
          description: "New tag has been added to your collection.",
        });
      }

      resetForm();
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tag: TagData) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "Tag deleted successfully!",
        description: "The tag has been removed from your collection.",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tag Management
            </CardTitle>
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
              setIsAddModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tag Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter tag name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the tag"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTag ? 'Update Tag' : 'Create Tag'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags?.map(tag => (
              <div 
                key={tag.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    {tag.description && (
                      <p className="text-sm text-gray-500">{tag.description}</p>
                    )}
                    {tag.is_system && (
                      <Badge variant="outline" className="text-xs">System</Badge>
                    )}
                  </div>
                </div>
                
                {!tag.is_system && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {tags?.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No tags created yet. Click "Add Tag" to create your first tag.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
