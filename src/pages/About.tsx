import { Link } from 'react-router-dom';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Target, Zap, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
          About tRIAL - cLIENTS
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          We're on a mission to help designers, developers, and creative professionals 
          sharpen their skills by providing realistic client briefs and project scenarios 
          powered by AI.
        </p>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Practice makes perfect, but finding realistic projects to work on can be challenging. 
            tRIAL - cLIENTS bridges that gap by generating authentic client briefs that simulate 
            real-world scenarios. Whether you're a junior designer building your portfolio or an 
            experienced developer exploring new industries, we've got you covered.
          </p>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-semibold">How It Works</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Choose Your Level</h3>
              <p className="text-sm text-muted-foreground">
                Select from Beginner, Intermediate, or Veteran difficulty levels.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">Generate a Brief</h3>
              <p className="text-sm text-muted-foreground">
                Our AI creates a detailed, realistic client brief for you.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Build & Learn</h3>
              <p className="text-sm text-muted-foreground">
                Work on the project and add it to your portfolio.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Our Team</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We're a small team of designers and developers who understand the challenges 
            of building a portfolio and gaining practical experience. We built tRIAL - cLIENTS 
            because we wished it existed when we were starting out.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-semibold">Our Values</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong className="text-foreground">Accessibility:</strong> Free beginner briefs for everyone.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong className="text-foreground">Quality:</strong> AI-generated briefs that feel real.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong className="text-foreground">Growth:</strong> Helping creatives level up their skills.</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center p-8 rounded-xl bg-gradient-hero border border-border">
          <h2 className="text-2xl font-bold mb-4">Ready to start practicing?</h2>
          <Link to="/auth">
            <Button className="bg-gradient-primary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;
