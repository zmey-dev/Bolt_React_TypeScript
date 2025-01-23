import { getSupabaseClient } from '../supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateSimilarImage(imageUrl: string): Promise<string> {
  try {
    // Convert image to base64
    const base64Image = await fetchImageAsBase64(imageUrl);

    // Get image description using Vision API
    const description = await getImageDescription(base64Image);

    // Generate new image using DALL-E with LED motif light display prompt
    const newImageUrl = await generateImage(description);

    return newImageUrl;
  } catch (error) {
    throw error;
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading image blob'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
}

async function getImageDescription(base64Image: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text',
                text: 'Describe the LED light display you see in this image. Focus on the main shape, size, and features that could be recreated as an LED motif light display for an outdoor Christmas light show. Keep the description concise and avoid unnecessary details.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              },
            ],
          },
        ],
        max_tokens: 100 // Limit the response to 100 tokens
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze image');
    }

    return data.choices[0].message.content;
  } catch (error) {
    throw error;
  }
}

async function generateImage(prompt: string): Promise<string> {
  const dallePrompt = `
    Create an LED motif light display version of the following description: ${prompt}.
    The design should resemble an LED motif light display used at an outdoor Christmas light show. Ensure the design is visually appealing from a distance.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        size: '1024x1024',
        quality: 'hd',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate image');
    }

    return data.data[0].url;
  } catch (error) {
    throw error;
  }
}