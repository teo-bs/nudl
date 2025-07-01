
-- Create enum types for better data integrity
CREATE TYPE public.post_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE public.tag_type AS ENUM ('auto', 'manual', 'system');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create saved posts table
CREATE TABLE public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  linkedin_post_id TEXT,
  post_url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  author_name TEXT,
  author_profile_url TEXT,
  author_avatar_url TEXT,
  post_date TIMESTAMP WITH TIME ZONE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status post_status DEFAULT 'active',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create post tags junction table
CREATE TABLE public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.saved_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  tag_type tag_type DEFAULT 'manual',
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

-- Create AI tagging rules table
CREATE TABLE public.ai_tagging_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10B981',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create collection posts junction table
CREATE TABLE public.collection_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.saved_posts(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, post_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tagging_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_posts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default tags for the user
  INSERT INTO public.tags (user_id, name, color, is_system)
  VALUES 
    (NEW.id, 'AI Technology', '#3B82F6', TRUE),
    (NEW.id, 'Business', '#10B981', TRUE),
    (NEW.id, 'Career', '#F59E0B', TRUE),
    (NEW.id, 'Industry News', '#EF4444', TRUE),
    (NEW.id, 'Personal Development', '#8B5CF6', TRUE);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for saved_posts table
CREATE POLICY "Users can manage own posts" ON public.saved_posts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tags table
CREATE POLICY "Users can manage own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for post_tags table
CREATE POLICY "Users can manage own post tags" ON public.post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.saved_posts 
      WHERE id = post_tags.post_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for ai_tagging_rules table
CREATE POLICY "Users can manage own AI rules" ON public.ai_tagging_rules
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for collections table
CREATE POLICY "Users can manage own collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable" ON public.collections
  FOR SELECT USING (is_public = TRUE);

-- RLS Policies for collection_posts table
CREATE POLICY "Users can manage own collection posts" ON public.collection_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE id = collection_posts.collection_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX idx_saved_posts_status ON public.saved_posts(status);
CREATE INDEX idx_saved_posts_saved_at ON public.saved_posts(saved_at DESC);
CREATE INDEX idx_saved_posts_is_favorite ON public.saved_posts(is_favorite);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON public.post_tags(tag_id);
CREATE INDEX idx_ai_tagging_rules_user_id ON public.ai_tagging_rules(user_id);
CREATE INDEX idx_ai_tagging_rules_active ON public.ai_tagging_rules(is_active);
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collections_public ON public.collections(is_public);
CREATE INDEX idx_collection_posts_collection_id ON public.collection_posts(collection_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_posts_updated_at
  BEFORE UPDATE ON public.saved_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_tagging_rules_updated_at
  BEFORE UPDATE ON public.ai_tagging_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
