
/// <reference types="chrome"/>

export interface PostData {
  content: string;
  author_name: string;
  author_avatar_url: string;
  post_url: string;
  linkedin_post_id: string;
  post_date: string;
  title: string;
  author_profile_url?: string;
  notes?: string;
}

export interface SavedPost extends PostData {
  id: string;
  user_id: string;
  saved_at: string;
  is_favorite: boolean;
  read_status: boolean;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface ExtensionMessage {
  action: string;
  postData?: PostData;
  [key: string]: any;
}

export interface ExtensionResponse {
  success: boolean;
  error?: string;
  posts?: SavedPost[];
  post?: SavedPost;
  active?: boolean;
  [key: string]: any;
}
