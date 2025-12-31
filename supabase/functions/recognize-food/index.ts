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

    // Access the API key from environment variables (Supabase secrets)
    // @ts-ignore
    const GOOGLE_CLOUD_VISION_API_KEY = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');

    if (!GOOGLE_CLOUD_VISION_API_KEY) {
      console.error('GOOGLE_CLOUD_VISION_API_KEY is not set in environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: API key missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

    const visionRequestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 10, // Request up to 10 labels
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
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', visionResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to get response from Google Vision API', details: errorText }), {
        status: visionResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionData = await visionResponse.json();

    const recognizedFoods: string[] = [];
    // Blacklist of general terms to filter out
    const blacklist = new Set([
      'food', 'dish', 'cuisine', 'ingredient', 'meal', 'produce', 'vegetable', 'fruit', 'meat', 'snack',
      'breakfast', 'lunch', 'dinner', 'staple food', 'natural foods', 'whole food', 'superfood', 'garnish',
      'side dish', 'comfort food', 'fast food', 'junk food', 'delicacy', 'local food', 'vegan cuisine',
      'vegetarian cuisine', 'diet food', 'health food', 'finger food', 'appetizer', 'dessert', 'sweet',
      'savory', 'baked goods', 'dairy product', 'seed', 'nut', 'berry', 'citrus', 'root vegetable',
      'leaf vegetable', 'cruciferous vegetable', 'legume', 'cereal', 'grain', 'herb', 'spice', 'condiment',
      'sauce', 'soup', 'stew', 'salad', 'sandwich', 'pizza', 'burger', 'pasta', 'rice', 'noodle', 'bread',
      'pastry', 'cake', 'cookie', 'candy', 'chocolate', 'ice cream', 'yogurt', 'cheese', 'milk', 'egg',
      'fish', 'poultry', 'beef', 'pork', 'lamb', 'seafood', 'shellfish', 'drink', 'beverage', 'juice',
      'soda', 'coffee', 'tea', 'alcohol', 'wine', 'beer', 'cocktail', 'distilled beverage', 'liqueur',
      'soft drink', 'carbonated soft drink', 'non-alcoholic beverage', 'water', 'mineral water', 'tap water',
      'bottled water', 'drinkware', 'tableware', 'cutlery', 'plate', 'bowl', 'cup', 'glass', 'fork', 'knife',
      'spoon', 'chopsticks', 'kitchen utensil', 'cooking utensil', 'kitchen appliance', 'oven', 'microwave oven',
      'refrigerator', 'freezer', 'blender', 'food processor', 'coffee maker', 'tea maker', 'toaster', 'grill',
      'frying pan', 'pot', 'wok', 'cutting board', 'knife block', 'kitchen scale', 'measuring cup', 'measuring spoon',
      'can opener', 'bottle opener', 'corkscrew', 'peeler', 'grater', 'slicer', 'colander', 'strainer', 'sieve',
      'whisk', 'spatula', 'ladle', 'tongs', 'basting brush', 'rolling pin', 'baking sheet', 'muffin tin', 'pie plate',
      'roasting pan', 'casserole dish', 'serving dish', 'serving bowl', 'serving platter', 'tray', 'coaster',
      'tablecloth', 'napkin', 'placemat', 'candle', 'flower', 'vase', 'centerpiece', 'table setting', 'dining table',
      'dining room', 'kitchen', 'restaurant', 'cafe', 'bar', 'pub', 'bakery', 'grocery store', 'supermarket',
      'farmers market', 'food stand', 'food truck', 'picnic', 'barbecue', 'buffet', 'catering', 'takeout', 'delivery',
      'eating', 'drinking', 'cooking', 'baking', 'grilling', 'roasting', 'frying', 'boiling', 'steaming', 'sautéing',
      'chopping', 'slicing', 'dicing', 'mincing', 'peeling', 'grating', 'mixing', 'stirring', 'whipping', 'kneading',
      'rolling', 'spreading', 'pouring', 'serving', 'eating utensil', 'kitchenware', 'cookware', 'bakeware',
      'tableware set', 'dinnerware', 'glassware', 'flatware', 'silverware', 'crockery', 'porcelain', 'ceramic',
      'earthenware', 'stoneware', 'melamine', 'plastic', 'wood', 'bamboo', 'metal', 'stainless steel', 'cast iron',
      'non-stick', 'oven-safe', 'dishwasher-safe', 'microwave-safe', 'freezer-safe', 'reusable', 'disposable',
      'biodegradable', 'compostable', 'recyclable', 'eco-friendly', 'sustainable', '' // Empty string to catch any empty descriptions
    ].map(term => term.toLowerCase()));

    const minScore = 0.7; // Minimum confidence score for a label to be considered

    if (visionData.responses && visionData.responses.length > 0 && visionData.responses[0].labelAnnotations) {
      for (const annotation of visionData.responses[0].labelAnnotations) {
        const description = annotation.description;
        const score = annotation.score;

        if (description && score >= minScore && !blacklist.has(description.toLowerCase())) {
          // Capitalize the first letter of each word for better display
          const formattedDescription = description.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          recognizedFoods.push(formattedDescription);
        }
      }
    }

    return new Response(JSON.stringify({ recognizedFoods }), {
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