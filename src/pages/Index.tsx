import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Tagging",
      description: "Nudl reads every post you save and instantly adds smart tags like \"Productivity,\" \"Hiring,\" or \"Startups.\""
    },
    {
      icon: "📁",
      title: "Your Private Dashboard", 
      description: "View and manage all your saved posts in one simple, searchable place — like a personal second brain."
    },
    {
      icon: "⚙️",
      title: "Custom Categorization Rules",
      description: "Want to tag posts with \"Design\" if they mention \"Figma\"? You can do that. Nudl is fully customizable."
    },
    {
      icon: "📥",
      title: "Import Past Saves",
      description: "Nudl helps you bring in the posts you already saved on LinkedIn."
    },
    {
      icon: "🔍",
      title: "Smart Search & Filters",
      description: "Instantly find what you're looking for — by keyword, tag, or date."
    }
  ];

  const personas = [
    {
      icon: "👩‍💼",
      title: "Sales pros",
      description: "Save pitch ideas and industry insights"
    },
    {
      icon: "🧠", 
      title: "Thought leaders",
      description: "Save post inspiration and frameworks"
    },
    {
      icon: "🧑‍🎓",
      title: "Job seekers", 
      description: "Save career advice and hiring posts"
    },
    {
      icon: "🧑‍💻",
      title: "Lifelong learners",
      description: "Save what sparks your curiosity"
    }
  ];

  const steps = [
    "Install the Nudl Chrome extension",
    "Click \"Save\" on any LinkedIn post", 
    "Nudl stores the post in your dashboard",
    "AI automatically tags and categorizes it",
    "You search, browse, and rediscover any post in seconds"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            nudl
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="glow" size="lg">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="glow" size="lg">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Stop Losing the Posts You Save
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Nudl is your AI-powered LinkedIn save button that organizes, tags, and resurfaces content — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="coral" size="xl" className="w-full sm:w-auto">
              Install Nudl
            </Button>
            <Button variant="coral-outline" size="xl" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
          
          {/* Visual Placeholder */}
          <div className="mt-16 glass-card rounded-2xl p-8 mx-auto max-w-2xl">
            <div className="bg-gradient-to-r from-primary/20 to-coral/20 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                🎬 Mockup or GIF showing "Save" button on a LinkedIn post
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 gradient-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            You save great LinkedIn posts — advice, ideas, insights — but never look at them again.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your saved folder becomes a graveyard of good intentions.
          </p>
          <div className="glass-card rounded-2xl p-8 inline-block">
            <p className="text-2xl font-semibold text-primary">
              Nudl brings those posts back to life. Organized. Smart. Useful.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">How Nudl Works</h2>
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="glass-card rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  {index + 1}
                </div>
                <p className="text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 gradient-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">What Nudl Does</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">From "Forgotten" to "Found"</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <span>❌</span> Before Nudl
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Saved posts disappear</li>
                  <li>• Manual tracking</li>
                  <li>• Cluttered bookmarks</li>
                  <li>• "Where was that post again?"</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-primary/30 glow-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <span>✅</span> With Nudl
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-foreground font-medium">
                  <li>• Every post is tagged & organized</li>
                  <li>• AI handles it</li>
                  <li>• Clean dashboard</li>
                  <li>• Found in seconds</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4 gradient-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Who Nudl Helps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <Card key={index} className="glass-card border-white/10 text-center hover:border-coral/30 transition-all duration-300">
                <CardHeader>
                  <div className="text-4xl mb-2">{persona.icon}</div>
                  <CardTitle className="text-lg text-primary">{persona.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {persona.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">See Nudl in Action</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Watch how Nudl transforms a simple "save" into a superpower.
          </p>
          <div className="glass-card rounded-2xl p-12">
            <div className="bg-gradient-to-r from-primary/20 to-coral/20 rounded-lg p-16 text-center">
              <p className="text-muted-foreground text-lg">
                🎥 Loom or animated UI demo goes here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 gradient-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">What Early Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-white/10">
              <CardContent className="pt-6">
                <blockquote className="text-lg mb-4 italic">
                  "I used to save posts and forget them. Now I actually find and use them."
                </blockquote>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-coral rounded-full"></div>
                  <div>
                    <p className="font-semibold">Alex</p>
                    <p className="text-sm text-muted-foreground">Product Marketer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardContent className="pt-6">
                <blockquote className="text-lg mb-4 italic">
                  "It's like Notion, but automatic and for your saved content."
                </blockquote>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-coral to-primary rounded-full"></div>
                  <div>
                    <p className="font-semibold">Maria</p>
                    <p className="text-sm text-muted-foreground">Career Coach</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Pricing</h2>
          <Card className="glass-card border-primary/30 glow-primary">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">Free during beta.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Pro features coming soon — like export to Notion, integrations, and team boards.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 gradient-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Build your second brain — one saved post at a time.
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Nudl helps you remember, organize, and act on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="coral" size="xl" className="w-full sm:w-auto">
              Install Nudl
            </Button>
            <Button variant="coral-outline" size="xl" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
              nudl
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">Product</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground">
            <p>Made with ❤️ using Lovable</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;