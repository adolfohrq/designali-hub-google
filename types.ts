export enum Page {
  Dashboard = 'Dashboard',
  Ferramentas = 'Ferramentas',
  Videos = 'Videos',
  Notas = 'Notas',
  Estudo = 'Estudo',
  Recursos = 'Recursos',
  Configuracoes = 'Configuracoes',
}

export interface Item {
  id: string;
  isFavorite: boolean;
}

export interface Tool extends Item {
  name: string;
  url: string;
  category: string;
  description: string;
  imageUrl?: string;  // Frontend uses camelCase, maps to 'icon' in DB
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SuggestedTool {
    name: string;
    url: string;
    category: string;
    description: string;
}

export interface Video extends Item {
  title: string;
  url: string;
  platform: 'YouTube' | 'Vimeo' | 'Other';
  channel: string;
  thumbnail_url?: string;
  source?: string;
  duration?: number;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note extends Item {
  title: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
    id: string;
    title: string;
    platform: string;
    progress: number; // 0-100
    status: 'Not Started' | 'In Progress' | 'Completed';
    description?: string;
    url?: string;
    is_favorite: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Tutorial {
    id: string;
    title: string;
    url: string;
    source: string;
    description?: string;
    is_favorite: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Resource extends Item {
    title: string;
    url: string;
    type: 'Article' | 'Book' | 'Podcast' | 'Other';
    description: string;
    author?: string;
    resource_type?: string;  // Maps to DB field
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    link?: string;
    created_at: string;
    updated_at: string;
}