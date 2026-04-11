CREATE TABLE public.story_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  pet_personality TEXT,
  pet_image_url TEXT,
  has_human BOOLEAN NOT NULL DEFAULT FALSE,
  human_is_minor BOOLEAN,
  human_description TEXT,
  human_image_url TEXT,
  human_terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  theme TEXT,
  art_style TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generating','complete','failed')),
  story_text TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
