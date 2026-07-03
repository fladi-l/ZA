export type TopicStatus = "nicht_begonnen" | "in_bearbeitung" | "erledigt";
export type Responsible = "ich" | "freundin" | "beide";

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string | null;
  status: TopicStatus;
  responsible: Responsible;
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface Note {
  id: string;
  topic_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  topic_id: string;
  label: string;
  is_done: boolean;
  sort_order: number;
  created_by: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  topic_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface Link {
  id: string;
  topic_id: string;
  url: string;
  label: string | null;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  topic_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface TripMeta {
  id: number;
  departure_date: string | null;
  return_date: string | null;
}

// Minimales Database-Typing für die Supabase-Clients.
// Für vollen Komfort später mit `supabase gen types typescript` ersetzen.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      topics: { Row: Topic; Insert: Partial<Topic>; Update: Partial<Topic> };
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> };
      checklist_items: { Row: ChecklistItem; Insert: Partial<ChecklistItem>; Update: Partial<ChecklistItem> };
      attachments: { Row: Attachment; Insert: Partial<Attachment>; Update: Partial<Attachment> };
      links: { Row: Link; Insert: Partial<Link>; Update: Partial<Link> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      trip_meta: { Row: TripMeta; Insert: Partial<TripMeta>; Update: Partial<TripMeta> };
    };
  };
};

// Anzeige-Metadaten je Themen-Slug: Icon-Komponente + Kontext für die KI.
export const TOPIC_ICON_MAP: Record<string, string> = {
  fluege: "Plane",
  mietwagen: "Car",
  unterkuenfte: "BedDouble",
  safari: "Binoculars",
  route: "Map",
  packliste: "Backpack",
  impfungen: "Syringe",
  reiseversicherung: "ShieldCheck",
  budget: "Wallet",
  aktivitaeten: "Compass",
  restaurants: "Utensils",
  einreise: "Stamp",
  sonstiges: "Sparkles",
};
