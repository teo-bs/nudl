
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, Moon, Sun, Tag, TrendingUp, Calendar, ExternalLink, Settings, Zap, Chrome } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OnboardingFlow from "@/components/OnboardingFlow";
import RuleBuilder from "@/components/RuleBuilder";
import ChromeExtensionDemo from "@/components/ChromeExtensionDemo";

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    content: "Just launched our new AI-powered analytics dashboard! The future of data visualization is here. Excited to share this journey with the community. #AI #Analytics #ProductLaunch",
    author: "Sarah Chen",
    authorImage: "/placeholder.svg",
    company: "TechFlow",
    date: "2024-01-15",
    url: "https://linkedin.com/posts/sarah-chen-123",
    aiTags: ["Product Launch", "AI Technology", "Analytics"],
    userTags: ["Inspiration", "Business"],
    engagement: "1.2K reactions"
  },
  {
    id: 2,
    content: "5 lessons I learned from scaling a startup from 0 to $10M ARR. Thread below 👇",
    author: "Mike Rodriguez",
    authorImage: "/placeholder.svg",
    company: "GrowthLabs",
    date: "2024-01-14",
    url: "https://linkedin.com/posts/mike-rodriguez-456",
    aiTags: ["Startup Growth", "Business Strategy", "Leadership"],
    userTags: ["Learning", "Business"],
    engagement: "856 reactions"
  },
  {
    id: 3,
    content: "Remote work isn't just about working from home. It's about building a culture of trust, communication, and results. Here's how we did it at our company.",
    author: "Emily Johnson",
    authorImage: "/placeholder.svg",
    company: "RemoteFirst",
    date: "2024-01-13",
    url: "https://linkedin.com/posts/emily-johnson-789",
    aiTags: ["Remote Work", "Company Culture", "Management"],
    userTags: ["Work Culture", "Management"],
    engagement: "643 reactions"
  }
];

const popularTags = [
  { name: "AI Technology", count: 24, color: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "Startup Growth", count: 18, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "Leadership", count: 15, color: "bg-green-100 text-green-800 border-green-200" },
  { name: "Product Launch", count: 12, color: "bg-orange-100 text-orange-800 border-orange-200" },
  { name: "Remote Work", count: 9, color: "bg-pink-100 text-pink-800 border-pink-200" }
];

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [posts] = useState(mockPosts);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.aiTags.includes(selectedTag) || post.userTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleSavePost = () => {
    toast({
      title: "Post saved successfully!",
      description: "Auto-tagged as 'Business Strategy'",
    });
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LinkedIn Saver
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={() => setShowOnboarding(true)}
                variant="outline"
                className="rounded-full px-6"
              >
                <Settings className="w-4 h-4 mr-2" />
                Setup
              </Button>
              <Button 
                onClick={handleSavePost}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl dark:bg-gray-800/80">
            <TabsTrigger value="dashboard" className="rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg">
              <Zap className="w-4 h-4 mr-2" />
              Auto Rules
            </TabsTrigger>
            <TabsTrigger value="extension" className="rounded-lg">
              <Chrome className="w-4 h-4 mr-2" />
              Extension
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">124</span>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">32</span>
                    <Tag className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">28</span>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Tags */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Most Saved Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {popularTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${tag.color} ${
                        selectedTag === tag.name ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    >
                      {tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts, authors, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80"
                />
              </div>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 dark:bg-gray-800/80">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={post.authorImage} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{post.author}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{post.company}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => window.open(post.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
                      {post.content}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">AI Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {post.aiTags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Your Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {post.userTags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{post.engagement}</span>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Edit Tags
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules">
            <RuleBuilder />
          </TabsContent>

          <TabsContent value="extension">
            <ChromeExtensionDemo />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setShowOnboarding(true)} className="w-full">
                    Run Setup Again
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Re-run the onboarding flow to change your templates, tags, and rules.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
