import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role for comprehensive data access
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Create user client to get user info
    const userSupabase = createClient(supabaseUrl!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false }
    });

    // Extract token and get user directly
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Invalid user token:', userError?.message);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid authentication token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { symptoms } = await req.json();
    
    console.log(`Starting AI diagnosis for user: ${user.id}`);

    // Aggregate all patient data
    const [
      profileResult,
      healthTrackingResult,
      medicationsResult,
      previousAssessmentsResult,
      mentalHealthResult,
      emergencyCheckinsResult
    ] = await Promise.all([
      // User profile
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      
      // Recent health tracking (last 30 days)
      supabase
        .from('health_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      // Current medications
      supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .is('end_date', null),
      
      // Previous symptom assessments (last 6 months)
      supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Recent mental health assessments
      supabase
        .from('mental_health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Emergency check-ins (last 90 days)
      supabase
        .from('emergency_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const profile = profileResult.data;
    const healthTracking = healthTrackingResult.data || [];
    const medications = medicationsResult.data || [];
    const previousAssessments = previousAssessmentsResult.data || [];
    const mentalHealth = mentalHealthResult.data || [];
    const emergencyCheckins = emergencyCheckinsResult.data || [];

    // Create comprehensive patient context for AI
    const patientContext = {
      demographics: {
        age: profile?.age,
        gender: profile?.gender,
        bmi: profile?.bmi,
        bloodGroup: profile?.blood_group
      },
      currentSymptoms: symptoms,
      recentHealthData: healthTracking.slice(0, 7), // Last week
      currentMedications: medications.map(med => ({
        name: med.medication_name,
        dosage: med.dosage,
        frequency: med.frequency,
        isPrescribed: med.is_prescribed
      })),
      medicalHistory: {
        previousDiagnoses: previousAssessments.map(a => ({
          symptoms: a.symptoms,
          diagnosis: a.ai_diagnosis,
          conditions: a.suspected_conditions,
          urgency: a.urgency_level,
          date: a.created_at
        })),
        mentalHealthStatus: mentalHealth.length > 0 ? {
          latestMoodScore: mentalHealth[0]?.mood_score,
          stressAnxiety: mentalHealth[0]?.stress_anxiety_overwhelm,
          sleepChanges: mentalHealth[0]?.sleep_changes,
          isUrgent: mentalHealth[0]?.is_flagged_urgent
        } : null,
        emergencyEvents: emergencyCheckins.map(ec => ({
          symptoms: ec.symptom_description,
          severity: ec.severity_level,
          urgencyScore: ec.urgency_score,
          date: ec.created_at
        }))
      }
    };

    // Create detailed medical prompt
    const medicalPrompt = `You are an AI medical assistant providing preliminary health assessment. Analyze the following patient data and current symptoms to provide a structured diagnosis.

PATIENT CONTEXT:
${JSON.stringify(patientContext, null, 2)}

INSTRUCTIONS:
1. Analyze all available patient data including medical history, current medications, recent health patterns, and mental health status
2. Consider the current symptoms in context of the patient's complete health profile
3. Provide differential diagnosis with confidence scores
4. Assess urgency level based on symptoms and patient history
5. Give specific, actionable recommendations
6. Always include disclaimer about seeking professional medical care

IMPORTANT: This is for preliminary assessment only. Always recommend professional medical consultation for serious symptoms.

Please respond in the following JSON format:
{
  "suspected_conditions": ["condition1", "condition2", "condition3"],
  "primary_diagnosis": "Most likely condition based on symptoms and history",
  "confidence_score": 85,
  "urgency_level": "low|medium|high",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2", 
    "When to seek immediate care"
  ],
  "reasoning": "Brief explanation of diagnosis reasoning",
  "red_flags": ["Any concerning symptoms that need immediate attention"],
  "follow_up_timeline": "When patient should follow up or seek care"
}`;

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a medical AI assistant that provides structured preliminary health assessments. Always respond in valid JSON format and include appropriate medical disclaimers.' 
          },
          { role: 'user', content: medicalPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiDiagnosis = JSON.parse(openAIData.choices[0].message.content);

    console.log('AI diagnosis received:', aiDiagnosis);

    // Save assessment to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('symptom_assessments')
      .insert({
        user_id: user.id,
        symptoms: symptoms,
        ai_diagnosis: aiDiagnosis.primary_diagnosis,
        suspected_conditions: aiDiagnosis.suspected_conditions,
        recommendations: aiDiagnosis.recommendations,
        confidence_score: aiDiagnosis.confidence_score,
        urgency_level: aiDiagnosis.urgency_level,
        doctor_reviewed: false
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      throw new Error('Failed to save assessment');
    }

    console.log('Assessment saved successfully');

    // Return comprehensive response
    return new Response(JSON.stringify({
      success: true,
      assessment: {
        id: savedAssessment.id,
        symptoms: symptoms,
        ai_diagnosis: aiDiagnosis.primary_diagnosis,
        suspected_conditions: aiDiagnosis.suspected_conditions,
        recommendations: aiDiagnosis.recommendations,
        confidence_score: aiDiagnosis.confidence_score,
        urgency_level: aiDiagnosis.urgency_level,
        reasoning: aiDiagnosis.reasoning,
        red_flags: aiDiagnosis.red_flags || [],
        follow_up_timeline: aiDiagnosis.follow_up_timeline,
        created_at: savedAssessment.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-diagnose function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});