import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, User, Heart, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  weight_kg: number;
  height_cm: number;
  location: string;
  blood_group: string;
  smoker: boolean;
  alcohol_drinker: boolean;
  chronic_conditions: string[];
  long_term_medications: string[];
  family_history: string[];
}

const CHRONIC_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Asthma', 'Sickle Cell', 'Heart Disease', 
  'Cancer', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'Other'
];

const FAMILY_HISTORY_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Cancer', 'Heart Disease', 'Stroke',
  'Mental Health Issues', 'Kidney Disease', 'Other'
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    date_of_birth: '',
    gender: '',
    weight_kg: 0,
    height_cm: 0,
    location: '',
    blood_group: '',
    smoker: false,
    alcohol_drinker: false,
    chronic_conditions: [],
    long_term_medications: [],
    family_history: []
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof OnboardingData, item: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), item]
        : (prev[field] as string[]).filter(x => x !== item)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Save onboarding data
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .insert({
          user_id: user.id,
          ...data
        });

      if (onboardingError) throw onboardingError;

      // Update profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          onboarding_completed: true,
          full_name: data.full_name,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          // Calculate BMI
          bmi: data.weight_kg / Math.pow(data.height_cm / 100, 2)
        });

      if (profileError) throw profileError;

      toast({
        title: "Welcome to Curable!",
        description: "Your health profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={data.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={data.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Gender *</Label>
                <RadioGroup
                  value={data.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="location">Location (City/State)</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Lagos, Nigeria"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Physical Health</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight_kg">Weight (kg) *</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={data.weight_kg || ''}
                  onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="height_cm">Height (cm) *</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={data.height_cm || ''}
                  onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="blood_group">Blood Group (if known)</Label>
              <RadioGroup
                value={data.blood_group}
                onValueChange={(value) => handleInputChange('blood_group', value)}
                className="mt-2 grid grid-cols-4 gap-2"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smoker"
                  checked={data.smoker}
                  onCheckedChange={(checked) => handleInputChange('smoker', checked)}
                />
                <Label htmlFor="smoker">Do you smoke?</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alcohol_drinker"
                  checked={data.alcohol_drinker}
                  onCheckedChange={(checked) => handleInputChange('alcohol_drinker', checked)}
                />
                <Label htmlFor="alcohol_drinker">Do you drink alcohol?</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Medical History</h2>
            </div>
            
            <div>
              <Label className="text-base font-medium">Do you have any chronic conditions?</Label>
              <div className="mt-3 space-y-2">
                {CHRONIC_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={data.chronic_conditions.includes(condition)}
                      onCheckedChange={(checked) => handleArrayChange('chronic_conditions', condition, !!checked)}
                    />
                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current long-term medications (if any)</Label>
              <Textarea
                id="medications"
                value={data.long_term_medications.join('\n')}
                onChange={(e) => handleInputChange('long_term_medications', e.target.value.split('\n').filter(x => x.trim()))}
                placeholder="List each medication on a new line"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Family History</h2>
            </div>
            
            <div>
              <Label className="text-base font-medium">Family history of chronic diseases</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Select any conditions that run in your family
              </p>
              <div className="space-y-2">
                {FAMILY_HISTORY_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`family_${condition}`}
                      checked={data.family_history.includes(condition)}
                      onCheckedChange={(checked) => handleArrayChange('family_history', condition, !!checked)}
                    />
                    <Label htmlFor={`family_${condition}`} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to Curable</CardTitle>
            <CardDescription className="text-center">
              Let's set up your health profile to personalize your experience
            </CardDescription>
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1"
              >
                {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}