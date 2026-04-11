import { generateMockStory } from './mock-engine';

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageDescription: string;
  imageBase64?: string; // base64 encoded image data
}

export interface GeneratedStory {
  title: string;
  pages: StoryPage[];
  coverImageBase64?: string;
}

export interface StoryInput {
  petName: string;
  petPersonality: string;
  petImageBase64?: string;
  hasHuman: boolean;
  humanIsMinor: boolean | null;
  humanDescription: string | null;
  humanHairColor: string | null;
  humanClothing: string | null;
  humanPersonality: string | null;
  humanImageBase64?: string;
  theme: string;
  artStyle: string;
  language: string; // 'en', 'es', 'fr', 'it'
}

/* -------------------------------------------------------------------------- */
/*  Language helpers                                                          */
/* -------------------------------------------------------------------------- */

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
};

const THEME_DESCRIPTIONS: Record<string, string> = {
  spaceAdventure: 'A space adventure with rockets, stars, and alien friends',
  underwaterKingdom:
    'An underwater kingdom with coral castles and sea creatures',
  enchantedForest:
    'An enchanted forest with talking trees and magical creatures',
  pirateTreasure:
    'A pirate treasure hunt across the seas with maps and hidden treasure',
  dinosaurLand:
    'A journey to a land of dinosaurs with prehistoric landscapes',
};

/* -------------------------------------------------------------------------- */
/*  OpenAI story generation                                                   */
/* -------------------------------------------------------------------------- */

async function generateWithOpenAI(input: StoryInput): Promise<GeneratedStory> {
  // Dynamic import so the module only loads when actually needed
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const languageName = LANGUAGE_NAMES[input.language] ?? 'English';
  const themeDesc =
    THEME_DESCRIPTIONS[input.theme] ?? `A ${input.theme} themed adventure`;

  // Build human character section for the system prompt
  let humanSection = '';
  if (input.hasHuman) {
    const parts: string[] = [];
    if (input.humanHairColor) parts.push(`hair color: ${input.humanHairColor}`);
    if (input.humanClothing) parts.push(`clothing: ${input.humanClothing}`);
    if (input.humanPersonality)
      parts.push(`personality: ${input.humanPersonality}`);
    if (input.humanDescription)
      parts.push(`description: ${input.humanDescription}`);
    const isMinor = input.humanIsMinor ? ' (a child)' : ' (an adult)';
    humanSection = `\n\nThe story also features a human companion${isMinor} with these traits: ${parts.join(', ')}.`;
  }

  const systemPrompt = `You are a children's storybook author. Write a 5-page story for a pet-themed picture book.

Pet name: ${input.petName}
Pet personality: ${input.petPersonality || 'friendly and curious'}
Theme: ${themeDesc}
Art style for illustrations: ${input.artStyle}${humanSection}

IMPORTANT: Write the ENTIRE story in ${languageName}.

Return your response as valid JSON with this exact structure:
{
  "title": "The story title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The page text (~100 words)",
      "imageDescription": "A detailed illustration description for DALL-E in English, incorporating the ${input.artStyle} art style"
    }
  ]
}

Rules:
- Exactly 5 pages
- Each page text should be approximately 100 words
- The story title and all page text MUST be in ${languageName}
- Image descriptions should always be in English for DALL-E and include the art style "${input.artStyle}"
- Make the story age-appropriate, warm, and engaging
- Include the pet by name throughout the story
- The story should have a clear beginning, middle, and satisfying ending`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: systemPrompt }],
    temperature: 0.8,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(responseText) as {
    title: string;
    pages: { pageNumber: number; text: string; imageDescription: string }[];
  };

  // Generate images with DALL-E 3 for each page
  const pages: StoryPage[] = [];
  for (const page of parsed.pages) {
    let imageBase64: string | undefined;
    try {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Children's book illustration in ${input.artStyle} style: ${page.imageDescription}. Cute, colorful, age-appropriate, no text or words in the image.`,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      });
      imageBase64 = imageResponse.data?.[0]?.b64_json ?? undefined;
    } catch (imgError) {
      console.error(
        `Failed to generate image for page ${page.pageNumber}:`,
        imgError
      );
      // Continue without the image — the PDF will show text only
    }

    pages.push({
      pageNumber: page.pageNumber,
      text: page.text,
      imageDescription: page.imageDescription,
      imageBase64,
    });
  }

  // Generate cover image
  let coverImageBase64: string | undefined;
  try {
    const coverResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Children's book cover illustration in ${input.artStyle} style featuring a pet named ${input.petName}. Theme: ${themeDesc}. Magical, inviting, colorful, age-appropriate, no text or words in the image.`,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });
    coverImageBase64 = coverResponse.data?.[0]?.b64_json ?? undefined;
  } catch (coverError) {
    console.error('Failed to generate cover image:', coverError);
  }

  return {
    title: parsed.title,
    pages,
    coverImageBase64,
  };
}

/* -------------------------------------------------------------------------- */
/*  Main entry point                                                          */
/* -------------------------------------------------------------------------- */

export async function generateStory(
  input: StoryInput
): Promise<GeneratedStory> {
  // Sanitize: if human is a minor, strip any image data for privacy
  if (input.hasHuman && input.humanIsMinor) {
    input.humanImageBase64 = undefined;
  }

  if (process.env.OPENAI_API_KEY) {
    return generateWithOpenAI(input);
  }

  // Fall back to mock engine when no API key is configured
  return generateMockStory(input);
}
