import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, MessageSquare, LogOut, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SymptomAssessment {
  id: string;
  symptoms: string;
  aiDiagnosis: string;
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  doctorReviewed: boolean;
}

export default function SymptomChecker() {
  const { user, signOut } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<SymptomAssessment | null>(null);

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockAssessment: SymptomAssessment = {
        id: Date.now().toString(),
        symptoms: symptoms,
        aiDiagnosis: "Based on your symptoms, this appears to be a common cold or upper respiratory infection.",
        confidence: 78,
        recommendations: [
          "Get plenty of rest",
          "Stay hydrated with warm fluids",
          "Consider over-the-counter pain relievers",
          "Monitor symptoms for 3-5 days"
        ],
        urgency: 'low',
        timestamp: new Date(),
        doctorReviewed: false
      };
      
      setAssessment(mockAssessment);
      setIsLoading(false);
    }, 2000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              AI Symptom{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Checker
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms in detail and get AI-powered health insights. 
              Remember, this is not a substitute for professional medical advice.
            </p>
          </div>

          {!assessment ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Describe Your Symptoms
                </CardTitle>
                <CardDescription>
                  Be as detailed as possible about what you're experiencing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="I've been experiencing headaches for the past 2 days, along with a runny nose and mild fever..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button 
                  onClick={handleSymptomSubmit}
                  disabled={!symptoms.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    'Get AI Assessment'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Assessment Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      AI Assessment Results
                    </CardTitle>
                    <Badge variant={getUrgencyColor(assessment.urgency)}>
                      {assessment.urgency.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  <CardDescription>
                    Confidence Level: {assessment.confidence}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Your Symptoms:</h4>
                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {assessment.symptoms}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">AI Diagnosis:</h4>
                    <p className="text-muted-foreground">
                      {assessment.aiDiagnosis}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-2">
                      {assessment.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Review Section */}
              <Card className="border-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-accent" />
                    Get Doctor Review
                  </CardTitle>
                  <CardDescription>
                    Have a qualified doctor review this AI assessment for professional medical guidance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button className="bg-accent hover:bg-accent/90">
                      Request Doctor Review
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Typical response time: 2-4 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAssessment(null);
                    setSymptoms('');
                  }}
                  className="flex-1"
                >
                  New Assessment
                </Button>
                <Button variant="secondary" className="flex-1">
                  Save to Health Records
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}