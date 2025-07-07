
export interface ExtensionMessage {
  action: string;
  [key: string]: any;
}

export interface ExtensionResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface PostData {
  content: string;
  author_name?: string;
  author_profile_url?: string;
  author_avatar_url?: string;
  post_url: string;
  post_date?: string;
  linkedin_post_id?: string;
  title?: string;
}
