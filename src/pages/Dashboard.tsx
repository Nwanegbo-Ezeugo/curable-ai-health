import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, MessageSquare, Users, Activity, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curable
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="touch-target">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              Welcome to the Future of{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Healthcare
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              We're building a community where AI and doctors work together to make healthcare 
              affordable, fast, and student-friendly across Africa.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-6 sm:mb-8 border-border/50 bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Our Mission</CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Revolutionizing healthcare accessibility in Africa
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Curable combines cutting-edge AI technology with expert medical knowledge to provide 
                instant health assessments, personalized recommendations, and direct access to qualified 
                healthcare professionals. We're making quality healthcare accessible to every student 
                and young professional across Africa.
              </p>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Describe your symptoms and get instant AI-powered health insights with 
                  probability-based diagnosis suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Doctor Reviews</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Get your AI assessment reviewed by qualified doctors for accurate, 
                  professional medical guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Health Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Monitor your daily health metrics and receive personalized insights 
                  to maintain optimal wellness.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-0">
              <Button size="lg" className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full touch-target" asChild>
                <a href="/symptom-checker">Start Symptom Check</a>
              </Button>
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full touch-target" asChild>
                <a href="/health-profile">Update Profile</a>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Join thousands of users already improving their health with AI-powered insights
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}