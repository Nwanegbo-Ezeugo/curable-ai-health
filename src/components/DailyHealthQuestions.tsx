import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyQuestion {
  id: string;
  question: string;
  type: 'radio' | 'number' | 'text' | 'boolean';
  options?: string[];
  field: string;
}

const DAILY_QUESTIONS_POOL: DailyQuestion[] = [
  {
    id: 'sleep',
    question: 'How many hours did you sleep last night?',
    type: 'number',
    field: 'sleep_hours'
  },
  {
    id: 'stress',
    question: 'How stressed do you feel today?',
    type: 'radio',
    options: ['Low', 'Medium', 'High'],
    field: 'stress_level'
  },
  {
    id: 'water',
    question: 'Did you drink water today? (approx. cups if yes)',
    type: 'number',
    field: 'water_intake_cups'
  },
  {
    id: 'exercise',
    question: 'Did you exercise today?',
    type: 'radio',
    options: ['No', 'Light', 'Moderate', 'Intense'],
    field: 'exercise_done'
  },
  {
    id: 'appetite',
    question: "How's your appetite today?",
    type: 'radio',
    options: ['Good', 'Poor', 'Skipped meals'],
    field: 'appetite'
  },
  {
    id: 'pain',
    question: 'Have you experienced any unusual pain today?',
    type: 'text',
    field: 'pain_location'
  },
  {
    id: 'symptoms',
    question: 'Any new symptoms today? (Cough, fever, headache, tiredness, etc.)',
    type: 'text',
    field: 'new_symptoms'
  },
  {
    id: 'mood',
    question: "How's your mood today?",
    type: 'radio',
    options: ['Happy', 'Neutral', 'Sad', 'Anxious'],
    field: 'mood'
  },
  {
    id: 'medications',
    question: 'Did you take your medications today?',
    type: 'radio',
    options: ['Yes', 'No', 'Forgot'],
    field: 'medications_taken'
  },
  {
    id: 'bowel',
    question: 'How many bowel movements today?',
    type: 'radio',
    options: ['Normal', 'Loose', 'Constipated'],
    field: 'bowel_movement'
  },
  {
    id: 'urine',
    question: 'Did you notice any changes in your urine?',
    type: 'radio',
    options: ['Normal', 'Dark', 'Painful', 'Frequent'],
    field: 'urine_changes'
  }
];

export default function DailyHealthQuestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todaysQuestions, setTodaysQuestions] = useState<DailyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodaysQuestions();
    }
  }, [user]);

  const checkTodaysQuestions = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already answered questions today
    const { data: existingEntry } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existingEntry) {
      setIsCompleted(true);
      return;
    }

    // Get 2-3 random questions for today
    const shuffled = [...DAILY_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setTodaysQuestions(selected);
  };

  const handleAnswer = (questionField: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionField]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < todaysQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const submitAnswers = async () => {
    if (!user) return;

    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Save to daily_questions table
      await supabase
        .from('daily_questions')
        .insert({
          user_id: user.id,
          date: today,
          questions_shown: todaysQuestions.map(q => q.id),
          questions_answered: answers
        });

      // Also save to health_tracking table
      const trackingData: any = {
        user_id: user.id,
        date: today
      };

      // Map answers to health_tracking fields
      Object.entries(answers).forEach(([field, value]) => {
        if (field === 'exercise_done') {
          trackingData.exercise_done = value !== 'No';
          if (value !== 'No') {
            trackingData.exercise_intensity = value.toLowerCase();
          }
        } else if (field === 'new_symptoms') {
          trackingData.new_symptoms = value ? [value] : [];
        } else if (field === 'pain_location') {
          trackingData.pain_experienced = !!value;
          if (value) trackingData.pain_location = value;
        } else if (field === 'medications_taken') {
          trackingData.medications_taken = value === 'Yes';
        } else {
          trackingData[field] = typeof value === 'string' ? value.toLowerCase() : value;
        }
      });

      await supabase
        .from('health_tracking')
        .insert(trackingData);

      setIsCompleted(true);
      toast({
        title: "Health questions completed!",
        description: "Thank you for tracking your daily health data.",
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (isCompleted) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Daily Health Check Complete
          </CardTitle>
          <CardDescription>
            You've completed today's health questions. Check back tomorrow for new questions!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (todaysQuestions.length === 0) {
    return null;
  }

  const currentQuestion = todaysQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / todaysQuestions.length) * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Daily Health Check</CardTitle>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {todaysQuestions.length}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.field] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.field, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.type === 'number' && (
            <Input
              type="number"
              placeholder="Enter number"
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => handleAnswer(currentQuestion.field, parseInt(e.target.value) || 0)}
            />
          )}
          
          {currentQuestion.type === 'text' && (
            <Textarea
              placeholder="Describe here..."
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => handleAnswer(currentQuestion.field, e.target.value)}
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={nextQuestion}
            disabled={isLoading}
            className="flex-1"
          >
            {currentQuestionIndex === todaysQuestions.length - 1 ? 'Complete' : 'Next'}
          </Button>
          <Button 
            variant="outline" 
            onClick={skipQuestion}
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}