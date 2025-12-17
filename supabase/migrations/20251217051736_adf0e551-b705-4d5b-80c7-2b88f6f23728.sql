-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  house_color TEXT NOT NULL CHECK (house_color IN ('red', 'blue', 'green', 'yellow')),
  address TEXT,
  its_number TEXT NOT NULL,
  mobile_number TEXT,
  grade TEXT NOT NULL,
  class TEXT NOT NULL,
  profile_photo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, its_number)
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members junction table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Create occasions table
CREATE TABLE public.occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  place TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kalam_assignments table
CREATE TABLE public.kalam_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE NOT NULL,
  kalam_type TEXT NOT NULL CHECK (kalam_type IN ('Salam', 'Noha', 'Madeh', 'Naat', 'Nasihat', 'Noha 2', 'Salam 2')),
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  kalam_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE NOT NULL,
  is_present BOOLEAN NOT NULL DEFAULT false,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, occasion_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kalam_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Members policies
CREATE POLICY "Users can view their own members"
  ON public.members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own members"
  ON public.members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own members"
  ON public.members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own members"
  ON public.members FOR DELETE
  USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view their own groups"
  ON public.groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = user_id);

-- Group members policies (user can manage if they own the group)
CREATE POLICY "Users can view group members for their groups"
  ON public.group_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.groups WHERE id = group_members.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert group members for their groups"
  ON public.group_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.groups WHERE id = group_members.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete group members for their groups"
  ON public.group_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.groups WHERE id = group_members.group_id AND user_id = auth.uid()
  ));

-- Occasions policies
CREATE POLICY "Users can view their own occasions"
  ON public.occasions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own occasions"
  ON public.occasions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own occasions"
  ON public.occasions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own occasions"
  ON public.occasions FOR DELETE
  USING (auth.uid() = user_id);

-- Kalam assignments policies (user can manage if they own the occasion)
CREATE POLICY "Users can view kalam for their occasions"
  ON public.kalam_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = kalam_assignments.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert kalam for their occasions"
  ON public.kalam_assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = kalam_assignments.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update kalam for their occasions"
  ON public.kalam_assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = kalam_assignments.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete kalam for their occasions"
  ON public.kalam_assignments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = kalam_assignments.occasion_id AND user_id = auth.uid()
  ));

-- Attendance policies (user can manage if they own the occasion)
CREATE POLICY "Users can view attendance for their occasions"
  ON public.attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = attendance.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert attendance for their occasions"
  ON public.attendance FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = attendance.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update attendance for their occasions"
  ON public.attendance FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = attendance.occasion_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete attendance for their occasions"
  ON public.attendance FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.occasions WHERE id = attendance.occasion_id AND user_id = auth.uid()
  ));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_occasions_updated_at
  BEFORE UPDATE ON public.occasions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();