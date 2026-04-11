import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateStory } from '@/lib/ai/story-engine';
import type { StoryInput } from '@/lib/ai/story-engine';
import { generatePdf } from '@/lib/pdf/generator';

export const maxDuration = 300; // allow up to 5 minutes for AI generation

export async function POST(request: NextRequest) {
  try {
    /* ---- Auth ---- */
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /* ---- Check payment ---- */
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single();

    if (!profile?.has_paid) {
      return NextResponse.json(
        { error: 'Payment required' },
        { status: 403 }
      );
    }

    /* ---- Parse input ---- */
    const body = (await request.json()) as StoryInput;

    const input: StoryInput = {
      petName: body.petName || 'Buddy',
      petPersonality: body.petPersonality || '',
      petImageBase64: body.petImageBase64,
      hasHuman: Boolean(body.hasHuman),
      humanIsMinor: body.humanIsMinor ?? null,
      humanDescription: body.humanDescription ?? null,
      humanHairColor: body.humanHairColor ?? null,
      humanClothing: body.humanClothing ?? null,
      humanPersonality: body.humanPersonality ?? null,
      humanImageBase64: body.humanImageBase64,
      theme: body.theme || 'spaceAdventure',
      artStyle: body.artStyle || 'cartoon',
      language: body.language || 'en',
    };

    /* ---- Generate story ---- */
    const story = await generateStory(input);

    /* ---- Generate PDF ---- */
    const pdfBuffer = await generatePdf(story);

    /* ---- Return as base64 JSON ---- */
    const pdfBase64 = pdfBuffer.toString('base64');

    return NextResponse.json({
      title: story.title,
      pdfBase64,
    });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
