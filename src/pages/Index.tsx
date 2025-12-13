import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import { AdSlot } from "@/components/AdSlot";
import { Helmet } from "react-helmet";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://yourdomain.com/#website",
        "url": "https://yourdomain.com/",
        "name": "tRIAL - cLIENTS",
        "description": "AI-powered client brief & project generator for designers and developers",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://yourdomain.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://yourdomain.com/#organization",
        "name": "tRIAL - cLIENTS",
        "url": "https://yourdomain.com/",
        "logo": "https://yourdomain.com/favicon.png",
        "sameAs": [
          "https://twitter.com/trial_clients"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "tRIAL - cLIENTS",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1000"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      
      {/* Footer */}
      <footer className="bg-surface border-t border-border py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/favicon.png" alt="tRIAL - cLIENTS logo" className="h-8 w-8 sm:h-10 sm:w-10" />
                <span className="font-display font-bold text-lg sm:text-xl text-gradient">
                  tRIAL - cLIENTS
                </span>
              </div>
              <p className="text-sm sm:text-base text-foreground-secondary max-w-md">
                Generate realistic client briefs and practice projects with AI. Free beginner briefs — upgrade for intermediate & veteran briefs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-foreground-secondary">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Templates</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-foreground-secondary">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-foreground-secondary text-center sm:text-left">
              © 2025-26 tRIAL - cLIENTS. All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-xs sm:text-sm text-foreground-secondary hover:text-foreground">Privacy</a>
              <a href="#" className="text-xs sm:text-sm text-foreground-secondary hover:text-foreground">Terms</a>
              <a href="#" className="text-xs sm:text-sm text-foreground-secondary hover:text-foreground">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
