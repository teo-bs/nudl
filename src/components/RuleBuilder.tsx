import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Zap, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  name: string;
  condition: 'contains' | 'startsWith' | 'endsWith' | 'equals';
  keywords: string[];
  tag: string;
  isActive: boolean;
}

const RuleBuilder = () => {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      name: 'AI Technology Posts',
      condition: 'contains',
      keywords: ['AI', 'artificial intelligence', 'machine learning', 'ML'],
      tag: 'AI Technology',
      isActive: true
    },
    {
      id: '2',
      name: 'Startup Growth',
      condition: 'contains',
      keywords: ['startup', 'growth', 'scaling', 'founder'],
      tag: 'Startup Growth',
      isActive: true
    }
  ]);

  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    condition: 'contains',
    keywords: [],
    tag: '',
    isActive: true
  });

  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && newRule.keywords) {
      setNewRule({
        ...newRule,
        keywords: [...newRule.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    if (newRule.keywords) {
      setNewRule({
        ...newRule,
        keywords: newRule.keywords.filter((_, i) => i !== index)
      });
    }
  };

  const saveRule = () => {
    if (newRule.name && newRule.keywords?.length && newRule.tag) {
      const rule: Rule = {
        id: Date.now().toString(),
        name: newRule.name,
        condition: newRule.condition || 'contains',
        keywords: newRule.keywords,
        tag: newRule.tag,
        isActive: true
      };
      
      setRules([...rules, rule]);
      setNewRule({
        name: '',
        condition: 'contains',
        keywords: [],
        tag: '',
        isActive: true
      });
      
      toast({
        title: "Rule created successfully!",
        description: `Posts matching your criteria will now be tagged as "${rule.tag}"`,
      });
    }
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule deleted",
      description: "The auto-tagging rule has been removed",
    });
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auto-Tag Rules</h2>
          <p className="text-gray-600 dark:text-gray-300">Create intelligent rules to automatically tag your saved posts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">AI Powered</span>
        </div>
      </div>

      {/* Create New Rule */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Create New Rule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="e.g., AI Technology Posts"
                value={newRule.name || ''}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tag-name">Tag to Apply</Label>
              <Input
                id="tag-name"
                placeholder="e.g., AI Technology"
                value={newRule.tag || ''}
                onChange={(e) => setNewRule({ ...newRule, tag: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="condition">When post content</Label>
            <Select 
              value={newRule.condition || 'contains'} 
              onValueChange={(value: 'contains' | 'startsWith' | 'endsWith' | 'equals') => 
                setNewRule({ ...newRule, condition: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains any of</SelectItem>
                <SelectItem value="startsWith">Starts with</SelectItem>
                <SelectItem value="endsWith">Ends with</SelectItem>
                <SelectItem value="equals">Exactly matches</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Keywords</Label>
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="Add keyword or phrase"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} type="button">Add</Button>
            </div>
            
            {newRule.keywords && newRule.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newRule.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={() => removeKeyword(index)}
                  >
                    {keyword}
                    <Trash2 className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={saveRule}
            disabled={!newRule.name || !newRule.keywords?.length || !newRule.tag}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Rule
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Rules ({rules.filter(r => r.isActive).length})</h3>
        
        {rules.map((rule) => (
          <Card key={rule.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80 transition-all duration-200 ${
            rule.isActive ? 'opacity-100' : 'opacity-60'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                    <Badge 
                      variant={rule.isActive ? "default" : "secondary"}
                      className={rule.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium">When post content {rule.condition}:</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <p>
                      <span className="font-medium">Apply tag:</span> 
                      <Badge className="ml-2 bg-purple-100 text-purple-800">
                        {rule.tag}
                      </Badge>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {rules.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
            <CardContent className="p-12 text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No rules created yet</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your first auto-tagging rule to get started with intelligent post organization.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RuleBuilder;
