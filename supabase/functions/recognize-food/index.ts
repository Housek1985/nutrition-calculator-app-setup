// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Missing imageBase64 in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // @ts-ignore
    const googleCloudVisionApiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');

    if (!googleCloudVisionApiKey) {
      return new Response(JSON.stringify({ error: 'Google Cloud Vision API Key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleCloudVisionApiKey}`;

    const visionRequestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10,
            },
          ],
        },
      ],
    };

    const visionResponse = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionRequestBody),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error('Google Cloud Vision API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to call Google Cloud Vision API', details: errorData }), {
        status: visionResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionData = await visionResponse.json();
    
    const labels: string[] = [];
    if (visionData.responses && visionData.responses.length > 0) {
      const response = visionData.responses[0];
      
      // Extract labels from LABEL_DETECTION
      if (response.labelAnnotations) {
        response.labelAnnotations.forEach((annotation: any) => {
          if (annotation.score > 0.7) { // Only include labels with high confidence
            labels.push(annotation.description);
          }
        });
      }

      // Extract labels from OBJECT_LOCALIZATION
      if (response.localizedObjectAnnotations) {
        response.localizedObjectAnnotations.forEach((annotation: any) => {
          if (annotation.score > 0.7) { // Only include objects with high confidence
            labels.push(annotation.name);
          }
        });
      }
    }

    // Filter out duplicates and return unique labels
    const uniqueLabels = [...new Set(labels)];

    return new Response(JSON.stringify({ recognizedFoods: uniqueLabels }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recognize-food function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});