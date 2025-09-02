import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OnboardingFlow from './OnboardingFlow';
import DailyHealthQuestions from './DailyHealthQuestions';
import WeeklyCheckin from './WeeklyCheckin';
import EmergencyCheckin from './EmergencyCheckin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, TrendingUp, User } from 'lucide-react';

export default function CurableFlow() {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      setOnboardingCompleted(profile?.onboarding_completed || false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  const handleEmergencySubmit = () => {
    setShowEmergency(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading your health profile...</h2>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show emergency check-in if triggered
  if (showEmergency) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto">
          <EmergencyCheckin onSubmit={handleEmergencySubmit} />
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowEmergency(false)}
              className="w-full"
            >
              Cancel Emergency Check-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with all check-in options
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Curable Health Monitor
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Your personalized health tracking
          </p>
        </div>
      </div>

      {/* Emergency Button */}
      <div className="p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={() => setShowEmergency(true)}
            variant="destructive"
            className="w-full mb-6 py-6 text-lg"
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            Emergency Symptom Check
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <Tabs defaultValue="daily" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <DailyHealthQuestions />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today's Health Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Drink at least 8 cups of water today</p>
                    <p>• Take a 10-minute walk if possible</p>
                    <p>• Practice deep breathing for stress relief</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <WeeklyCheckin />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Health Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Your weekly patterns help us understand your health baseline and detect changes early.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health Profile</CardTitle>
                  <CardDescription>
                    Your personal health information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Onboarding completed</p>
                    <p>✓ Daily check-ins active</p>
                    <p>✓ Health monitoring enabled</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About Curable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Curable uses AI to monitor your health patterns and detect potential issues early.</p>
                    <p>Your data is private and secure, used only to improve your health outcomes.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}