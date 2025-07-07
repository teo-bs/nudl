
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedPostsList } from './SavedPostsList';
import { TagsManager } from './TagsManager';
import { AddPostModal } from './AddPostModal';
import { useQuery } from '@tanstack/react-query';
import { Plus, BookOpen, Tag, Heart, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const [postsResult, tagsResult, favoritesResult] = await Promise.all([
        supabase
          .from('saved_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('tags')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('saved_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_favorite', true),
      ]);

      return {
        totalPosts: postsResult.count || 0,
        totalTags: tagsResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
      };
    },
    enabled: !!user,
  });

  const handlePostAdded = () => {
    refetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-spotify-glow">Dashboard</h1>
          <p className="text-muted-foreground">Manage your saved LinkedIn posts and tags</p>
        </div>
        <Button variant="spotify" size="xl" onClick={() => setIsAddPostModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-[hsl(var(--spotify-green))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-spotify-glow">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              LinkedIn posts saved
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-[hsl(var(--spotify-green))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-spotify-glow">{stats?.totalTags || 0}</div>
            <p className="text-xs text-muted-foreground">
              Organization tags created
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-[hsl(var(--spotify-green))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-spotify-glow">{stats?.totalFavorites || 0}</div>
            <p className="text-xs text-muted-foreground">
              Posts marked as favorites
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass">
          <TabsTrigger value="posts" className="font-semibold">Saved Posts</TabsTrigger>
          <TabsTrigger value="tags" className="font-semibold">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <SavedPostsList />
        </TabsContent>
        
        <TabsContent value="tags" className="mt-6">
          <TagsManager />
        </TabsContent>
      </Tabs>

      {/* Add Post Modal */}
      <AddPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        onSuccess={handlePostAdded}
      />
    </div>
  );
};
