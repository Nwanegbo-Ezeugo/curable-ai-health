import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, User, LogOut, Save, Calculator, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  age?: number;
  blood_group?: string;
  bmi?: number;
  created_at?: string;
  email?: string;
  full_name?: string;
  gender?: string;
  genotype?: string;
  height_cm?: number;
  updated_at?: string;
  weight_kg?: number;
}

export default function HealthProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    height: '',
    weight: '',
    genotype: '',
    blood_group: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          gender: data.gender || '',
          height: data.height_cm?.toString() || '',
          weight: data.weight_kg?.toString() || '',
          genotype: data.genotype || '',
          blood_group: data.blood_group || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'secondary' };
    if (bmi < 25) return { category: 'Normal', color: 'primary' };
    if (bmi < 30) return { category: 'Overweight', color: 'secondary' };
    return { category: 'Obese', color: 'destructive' };
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);
      const bmi = height && weight ? calculateBMI(height, weight) : null;

      const profileData = {
        id: user.id,
        full_name: formData.full_name || null,
        gender: formData.gender || null,
        height_cm: height || null,
        weight_kg: weight || null,
        bmi: bmi,
        genotype: formData.genotype || null,
        blood_group: formData.blood_group || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentBMI = formData.height && formData.weight 
    ? calculateBMI(parseFloat(formData.height), parseFloat(formData.weight))
    : profile?.bmi;

  const bmiInfo = currentBMI ? getBMICategory(currentBMI) : null;

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
              Health{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Profile
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your personal health information for better AI assessments and personalized care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic demographic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>


                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Health Metrics
                </CardTitle>
                <CardDescription>
                  Physical measurements and health indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="70"
                    />
                  </div>
                </div>

                {currentBMI && bmiInfo && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">BMI: {currentBMI}</span>
                      <Badge variant={bmiInfo.color as any}>
                        {bmiInfo.category}
                      </Badge>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="genotype">Genotype</Label>
                  <Select 
                    value={formData.genotype} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, genotype: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AA">AA</SelectItem>
                      <SelectItem value="AS">AS</SelectItem>
                      <SelectItem value="SS">SS</SelectItem>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select 
                    value={formData.blood_group} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-6 text-center">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="lg"
              className="min-w-32"
            >
              {saving ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}