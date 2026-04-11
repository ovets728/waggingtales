export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  has_paid: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryProject {
  id: string;
  user_id: string;
  pet_name: string;
  pet_personality: string;
  pet_image_url: string;
  has_human: boolean;
  human_is_minor: boolean | null;
  human_description: string | null;
  human_image_url: string | null;
  human_terms_accepted: boolean;
  theme: string;
  art_style: string;
  language: string;
  status: 'draft' | 'generating' | 'complete' | 'failed';
  story_text: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      story_projects: {
        Row: StoryProject;
        Insert: Omit<StoryProject, 'id' | 'created_at'>;
        Update: Partial<Omit<StoryProject, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
