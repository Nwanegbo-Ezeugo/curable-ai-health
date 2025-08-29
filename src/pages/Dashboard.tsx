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
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curable
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to the Future of{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Healthcare
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're building a community where AI and doctors work together to make healthcare 
              affordable, fast, and student-friendly across Africa.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-8 border-border/50 bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Our Mission</CardTitle>
              <CardDescription className="text-lg">
                Revolutionizing healthcare accessibility in Africa
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Curable combines cutting-edge AI technology with expert medical knowledge to provide 
                instant health assessments, personalized recommendations, and direct access to qualified 
                healthcare professionals. We're making quality healthcare accessible to every student 
                and young professional across Africa.
              </p>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Describe your symptoms and get instant AI-powered health insights with 
                  probability-based diagnosis suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Doctor Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Get your AI assessment reviewed by qualified doctors for accurate, 
                  professional medical guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Health Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Monitor your daily health metrics and receive personalized insights 
                  to maintain optimal wellness.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/symptom-checker">Start Symptom Check</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <a href="/health-profile">Update Profile</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Join thousands of users already improving their health with AI-powered insights
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}