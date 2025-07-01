
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ArrowRight, ArrowLeft, Tag, Zap, Target, Briefcase, TrendingUp, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const templates = [
  {
    id: 'sales',
    name: 'Sales & Marketing',
    icon: TrendingUp,
    description: 'Track industry insights, competitor updates, and sales strategies',
    tags: ['Lead Generation', 'Marketing Strategy', 'Sales Tips'],
    rules: ['If post contains "B2B" or "sales", tag as "Sales Strategy"']
  },
  {
    id: 'business',
    name: 'Business Growth',
    icon: Briefcase,
    description: 'Save startup stories, business advice, and growth hacks',
    tags: ['Startup Growth', 'Business Strategy', 'Entrepreneurship'],
    rules: ['If post contains "startup" or "growth", tag as "Business Growth"']
  },
  {
    id: 'personal',
    name: 'Personal Development',
    icon: Heart,
    description: 'Collect career advice, learning resources, and inspiration',
    tags: ['Career Growth', 'Learning', 'Motivation'],
    rules: ['If post contains "career" or "personal development", tag as "Growth"']
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTags, setCustomTags] = useState<string[]>(['']);
  const [customRule, setCustomRule] = useState('');
  const [importMethod, setImportMethod] = useState<'manual' | 'permission'>('manual');

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Welcome to LinkedIn Saver! 🎉",
        description: "Your dashboard is ready. Start saving posts with AI-powered tagging!",
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addCustomTag = () => {
    if (customTags.length < 5) {
      setCustomTags([...customTags, '']);
    }
  };

  const updateCustomTag = (index: number, value: string) => {
    const updated = [...customTags];
    updated[index] = value;
    setCustomTags(updated);
  };

  const removeCustomTag = (index: number) => {
    if (customTags.length > 1) {
      setCustomTags(customTags.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to LinkedIn Saver
            </CardTitle>
            <p className="text-gray-600 mt-2">Let's set up your AI-powered post saving system</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index + 1 <= currentStep 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1 <= currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-8 h-1 mx-2 rounded transition-all duration-300 ${
                    index + 1 < currentStep ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Choose Template */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Your Starting Template</h3>
                <p className="text-gray-600">Pick a template that matches your goals, or customize later</p>
              </div>
              
              <div className="grid gap-4">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedTemplate === template.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{template.name}</h4>
                            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {template.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Custom Tags */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Add Your Custom Tags</h3>
                <p className="text-gray-600">Create tags that match your specific interests</p>
              </div>
              
              <div className="space-y-4">
                {customTags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Label htmlFor={`tag-${index}`} className="sr-only">Tag {index + 1}</Label>
                      <Input
                        id={`tag-${index}`}
                        placeholder={`Custom tag ${index + 1}`}
                        value={tag}
                        onChange={(e) => updateCustomTag(index, e.target.value)}
                      />
                    </div>
                    {customTags.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomTag(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                {customTags.length < 5 && (
                  <Button variant="outline" onClick={addCustomTag} className="w-full">
                    Add Another Tag
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Create Rule */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Create Your First Auto-Tag Rule</h3>
                <p className="text-gray-600">Set up intelligent tagging based on post content</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule">Auto-Tag Rule</Label>
                  <Input
                    id="rule"
                    placeholder='e.g., "If post contains AI or artificial intelligence, tag as Tech"'
                    value={customRule}
                    onChange={(e) => setCustomRule(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use natural language to describe when posts should be auto-tagged
                  </p>
                </div>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                        <p className="text-blue-700 text-sm">
                          Our AI will understand your rules and automatically apply tags to new posts. 
                          You can always edit or add more rules later!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Import Existing Posts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Import Your Saved LinkedIn Posts</h3>
                <p className="text-gray-600">Bring in your previously saved posts to get started</p>
              </div>
              
              <div className="space-y-4">
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    importMethod === 'manual' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setImportMethod('manual')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                      <div>
                        <h4 className="font-medium">Manual Import (Recommended)</h4>
                        <p className="text-sm text-gray-600">
                          Paste LinkedIn post URLs one by one for precise control
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    importMethod === 'permission' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setImportMethod('permission')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                      <div>
                        <h4 className="font-medium">Bulk Import (Coming Soon)</h4>
                        <p className="text-sm text-gray-600">
                          Connect directly to LinkedIn for automatic import
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Getting Started</h4>
                        <p className="text-yellow-700 text-sm">
                          Don't worry about importing everything now. You can always add posts later 
                          using our Chrome extension or manual import feature.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <Separator />
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedTemplate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center space-x-2"
            >
              <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
