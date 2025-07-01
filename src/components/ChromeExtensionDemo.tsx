
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, Check, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ChromeExtensionDemo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePost = () => {
    setIsSaved(true);
    toast({
      title: "Post saved! 🎉",
      description: "Auto-tagged as 'AI Technology'",
    });
    
    // Reset after animation
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chrome Extension Preview</h2>
        <p className="text-gray-600 dark:text-gray-300">See how the floating save button will appear on LinkedIn posts</p>
      </div>

      {/* Simulated LinkedIn Post */}
      <div className="relative">
        <Card 
          className="bg-white border shadow-sm hover:shadow-md transition-all duration-200 max-w-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    SC
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-600">Product Manager at TechFlow • 2h</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Just launched our new AI-powered analytics dashboard! 🚀 The future of data visualization is here. 
              After months of development, we're excited to share this breakthrough with the community. 
              
              Key features:
              • Real-time AI insights
              • Natural language queries  
              • Predictive analytics
              • Seamless integrations
              
              What trends are you seeing in AI tools? Would love to hear your thoughts! 
              
              #AI #Analytics #ProductLaunch #TechInnovation
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t">
              <span>👍 124</span>
              <span>💬 18 comments</span>
              <span>🔄 12 reposts</span>
            </div>
          </CardContent>

          {/* Floating Save Button - appears on hover */}
          <div className={`absolute top-4 right-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <Button
              onClick={handleSavePost}
              disabled={isSaved}
              className={`
                rounded-xl backdrop-blur-md border border-white/20 shadow-lg
                transition-all duration-300 hover:scale-105 active:scale-95
                ${isSaved 
                  ? 'bg-green-500/90 hover:bg-green-500/90 text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900'
                }
              `}
              size="sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Post
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• Hover over any LinkedIn post to reveal the glassmorphic save button</li>
                  <li>• Click to instantly extract and save post content, author, and link</li>
                  <li>• AI automatically analyzes and tags the post based on your rules</li>
                  <li>• Toast notification confirms the save with the applied tag</li>
                  <li>• All saved posts appear in your centralized dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Implementation Preview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
        <CardHeader>
          <CardTitle>Extension Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Content Script Features</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• DOM manipulation for button injection</li>
                <li>• Post content extraction</li>
                <li>• Author and metadata capture</li>
                <li>• Hover state management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Integration</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Secure backend communication</li>
                <li>• Real-time AI tagging</li>
                <li>• User authentication</li>
                <li>• Error handling & retry logic</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">Manifest V3</Badge>
            <Badge variant="outline">Content Scripts</Badge>
            <Badge variant="outline">Background Service</Badge>
            <Badge variant="outline">Chrome Storage API</Badge>
            <Badge variant="outline">Cross-Origin Requests</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChromeExtensionDemo;
