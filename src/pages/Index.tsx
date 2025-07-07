
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation, useStickyBar } from '@/hooks/useScrollAnimation';
import { AnimatedSection } from '@/components/AnimatedSection';
import { StickyInstallBar } from '@/components/StickyInstallBar';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Tagging",
      description: "Croi reads every post you save and instantly adds smart tags like \"Productivity,\" \"Hiring,\" or \"Startups.\""
    },
    {
      icon: "📁",
      title: "Your Private Dashboard", 
      description: "View and manage all your saved posts in one simple, searchable place — like a personal second brain."
    },
    {
      icon: "⚙️",
      title: "Custom Categorization Rules",
      description: "Want to tag posts with \"Design\" if they mention \"Figma\"? You can do that. Croi is fully customizable."
    },
    {
      icon: "📥",
      title: "Import Past Saves",
      description: "Croi helps you bring in the posts you already saved on LinkedIn."
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
    "Install the Croi Chrome extension",
    "Click \"Save\" on any LinkedIn post", 
    "Croi stores the post in your dashboard",
    "AI automatically tags and categorizes it",
    "You search, browse, and rediscover any post in seconds"
  ];

  return (
    <div className="min-h-screen gradient-spotify">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-white text-spotify-glow hover:opacity-80 transition-opacity">
            Croi
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="spotify" size="lg">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="spotify" size="lg">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight text-spotify-glow">
            Stop Losing the Posts You Save
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Croi is your AI-powered LinkedIn save button that organizes, tags, and resurfaces content — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="spotify" size="xl" className="w-full sm:w-auto">
              Install Croi
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
          
          {/* Visual Placeholder */}
          <div className="mt-16 glass-card p-8 mx-auto max-w-2xl">
            <div className="bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-xl p-12 text-center border border-green-500/20">
              <p className="text-gray-300">
                🎬 Mockup or GIF showing "Save" button on a LinkedIn post
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <AnimatedSection className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            You save great LinkedIn posts — advice, ideas, insights — but never look at them again.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Your saved folder becomes a graveyard of good intentions.
          </p>
          <div className="glass-card p-8 inline-block">
            <p className="text-2xl font-semibold text-[hsl(var(--spotify-green))] text-spotify-glow">
              Croi brings those posts back to life. Organized. Smart. Useful.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works */}
      <AnimatedSection className="py-20 px-4" delay={200}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">How Croi Works</h2>
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <AnimatedSection key={index} className="text-center" delay={index * 120}>
                <div className="glass rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[hsl(var(--spotify-green))] spotify-glow">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-300">{step}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Core Features */}
      <AnimatedSection className="py-20 px-4" delay={400}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">What Croi Does</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 120}>
                <Card className="glass-card border-white/10 hover:border-[hsl(var(--spotify-green))]/30 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Before & After */}
      <AnimatedSection className="py-20 px-4" delay={600}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">From "Forgotten" to "Found"</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <span>❌</span> Before Croi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li>• Saved posts disappear</li>
                  <li>• Manual tracking</li>
                  <li>• Cluttered bookmarks</li>
                  <li>• "Where was that post again?"</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-[hsl(var(--spotify-green))]/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--spotify-green))]">
                  <span>✅</span> With Croi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white font-medium">
                  <li>• Every post is tagged & organized</li>
                  <li>• AI handles it</li>
                  <li>• Clean dashboard</li>
                  <li>• Found in seconds</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedSection>

      {/* Who It's For */}
      <AnimatedSection className="py-20 px-4" delay={800}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">Who Croi Helps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <AnimatedSection key={index} delay={index * 120}>
                <Card className="glass-card border-white/10 text-center hover:border-[hsl(var(--spotify-green))]/30 transition-all duration-300">
                  <CardHeader>
                    <div className="text-4xl mb-2">{persona.icon}</div>
                    <CardTitle className="text-lg text-[hsl(var(--spotify-green))]">{persona.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      {persona.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Demo */}
      <AnimatedSection className="py-20 px-4" delay={1000}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">See Croi in Action</h2>
          <p className="text-xl text-gray-300 mb-12">
            Watch how Croi transforms a simple "save" into a superpower.
          </p>
          <div className="glass-card p-12">
            <div className="bg-gradient-to-br from-green-500/10 to-green-400/5 rounded-xl p-16 text-center border border-green-500/20">
              <p className="text-gray-300 text-lg">
                🎥 Loom or animated UI demo goes here
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="py-20 px-4" delay={1200}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">What Early Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={1300}>
              <Card className="glass-card border-white/10">
                <CardContent className="pt-6">
                  <blockquote className="text-lg mb-4 italic text-gray-300">
                    "I used to save posts and forget them. Now I actually find and use them."
                  </blockquote>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-[hsl(var(--spotify-green))] to-[hsl(141_76%_42%)] rounded-full"></div>
                    <div>
                      <p className="font-semibold text-white">Alex</p>
                      <p className="text-sm text-gray-400">Product Marketer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection delay={1400}>
              <Card className="glass-card border-white/10">
                <CardContent className="pt-6">
                  <blockquote className="text-lg mb-4 italic text-gray-300">
                    "It's like Notion, but automatic and for your saved content."
                  </blockquote>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-[hsl(var(--spotify-green))] to-[hsl(141_76%_42%)] rounded-full"></div>
                    <div>
                      <p className="font-semibold text-white">Maria</p>
                      <p className="text-sm text-gray-400">Career Coach</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing */}
      <AnimatedSection className="py-20 px-4" delay={1600}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Pricing</h2>
          <Card className="glass-card border-[hsl(var(--spotify-green))]/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-[hsl(var(--spotify-green))] text-spotify-glow">Free during beta.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-300">
                Pro features coming soon — like export to Notion, integrations, and team boards.
              </p>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection className="py-20 px-4" delay={1800}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white text-spotify-glow">
            Build your second brain — one saved post at a time.
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Croi helps you remember, organize, and act on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="spotify" size="xl" className="w-full sm:w-auto">
              Install Croi
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="text-2xl font-bold text-[hsl(var(--spotify-green))] hover:opacity-80 transition-opacity text-spotify-glow">
              Croi
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <Link to="#" className="hover:text-white transition-colors">Product</Link>
              <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms</Link>
              <Link to="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>Made with ❤️ using Lovable</p>
          </div>
        </div>
      </footer>

      {/* Sticky Install Bar */}
      <StickyInstallBar />
    </div>
  );
};

export default Index;
