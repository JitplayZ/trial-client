import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Sparkles, User, Target, Code } from "lucide-react";
import { useState } from "react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    experience: "",
    goals: "",
    projectTypes: [] as string[]
  });

  const skills = [
    "Frontend Development", "Backend Development", "Full-Stack", "Mobile Development",
    "UI/UX Design", "DevOps", "Data Science", "Machine Learning", "API Development",
    "E-commerce", "SaaS", "Marketing Sites", "Portfolio Sites"
  ];

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      console.log("Completing onboarding...", { formData, selectedSkills });
      window.location.href = "/dashboard";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Tell us about yourself</h2>
              <p className="text-foreground-secondary">Help us personalize your AI project experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Developer, Designer, Freelancer, Entrepreneur"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <select 
                  className="w-full mt-2 p-3 border border-border rounded-lg bg-surface"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner (0-2 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="advanced">Advanced (5+ years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Choose your skills</h2>
              <p className="text-foreground-secondary">Select the areas you're interested in or experienced with</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className={`p-3 cursor-pointer transition-all hover-lift text-center ${
                    selectedSkills.includes(skill) 
                      ? 'bg-gradient-primary text-primary-foreground' 
                      : 'hover:border-primary'
                  }`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-foreground-secondary text-center">
              Select as many as you'd like. This helps us suggest relevant project templates.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">What's your goal?</h2>
              <p className="text-foreground-secondary">Tell us what you want to achieve with AIProjects</p>
            </div>

            <div>
              <Label htmlFor="goals">Your Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g., Build a portfolio, create client projects, learn new technologies, start a business..."
                className="mt-2 min-h-32"
              />
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent mb-1">AI Personalization</p>
                  <p className="text-foreground-secondary">
                    Based on your selections, we'll recommend the best project templates and features for your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep 
                    ? 'bg-gradient-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {step < 3 && (
                <div 
                  className={`w-16 h-1 mx-2 rounded-full ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-display">Welcome to AIProjects</CardTitle>
            <CardDescription>
              Step {currentStep} of 3 — Let's set up your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {renderStep()}

            <div className="flex justify-between items-center pt-6 mt-6 border-t border-border/20">
              <div className="text-sm text-foreground-secondary">
                Step {currentStep} of 3
              </div>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-primary hover-glow"
                disabled={
                  (currentStep === 1 && !formData.name) ||
                  (currentStep === 2 && selectedSkills.length === 0)
                }
              >
                {currentStep === 3 ? (
                  <>
                    Complete Setup
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;