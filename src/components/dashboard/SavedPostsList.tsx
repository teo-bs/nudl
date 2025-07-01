
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, Heart, Clock, Tag, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SavedPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar_url: string;
  post_url: string;
  saved_at: string;
  is_favorite: boolean;
  read_status: boolean;
  tags: Array<{ id: string; name: string; color: string }>;
}

export const SavedPostsList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          post_tags (
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return data.map(post => ({
        ...post,
        tags: post.post_tags?.map(pt => pt.tags).filter(Boolean) || []
      }));
    },
    enabled: !!user,
  });

  const { data: tags } = useQuery({
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

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || 
                      post.tags.some(tag => tag.id === selectedTag);
    
    const matchesFavorite = favoriteFilter === 'all' ||
                           (favoriteFilter === 'favorites' && post.is_favorite) ||
                           (favoriteFilter === 'not-favorites' && !post.is_favorite);

    return matchesSearch && matchesTag && matchesFavorite;
  });

  const toggleFavorite = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_posts')
        .update({ is_favorite: !currentStatus })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Added to favorites" : "Removed from favorites",
        description: "Post updated successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('saved_posts')
        .update({ read_status: true })
        .eq('id', postId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error marking as read:', error);
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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {tags?.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by favorites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All posts</SelectItem>
                <SelectItem value="favorites">Favorites only</SelectItem>
                <SelectItem value="not-favorites">Non-favorites</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No posts found. Start saving some LinkedIn posts!</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts?.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author_avatar_url} />
                      <AvatarFallback>
                        {post.author_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author_name || 'Unknown Author'}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.saved_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(post.id, post.is_favorite)}
                      className={post.is_favorite ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`w-4 h-4 ${post.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={() => markAsRead(post.id)}
                    >
                      <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {post.title && (
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                )}

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.content}
                </p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        style={{ 
                          borderColor: tag.color, 
                          color: tag.color,
                          backgroundColor: `${tag.color}10`
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {!post.read_status && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Unread
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
