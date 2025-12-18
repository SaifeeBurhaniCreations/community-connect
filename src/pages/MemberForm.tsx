import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useMembers, Member } from '@/hooks/useDatabase';
import { uploadToS3 } from '@/lib/s3Upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

const GRADES = ['Z', 'A', 'B', 'C', 'D'];

export function MemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMembers, getMember, createMember, updateMember } = useMembers();
  
  const [existingMember, setExistingMember] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    house_color: 'blue',
    address: '',
    its_number: '',
    mobile_number: '',
    grade: 'Z',
    class: 'A',
    profile_photo: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setPageLoading(true);
      const members = await getMembers();
      setAllMembers(members || []);
      
      if (id) {
        const member = await getMember(id);
        if (member) {
          setExistingMember(member);
          setForm({
            name: member.name,
            surname: member.surname,
            house_color: member.house_color,
            address: member.address || '',
            its_number: member.its_number,
            mobile_number: member.mobile_number || '',
            grade: member.grade,
            class: member.class,
            profile_photo: member.profile_photo || '',
            is_active: member.is_active,
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields - only name is required
    if (!form.name) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter the member name.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Validate ITS number uniqueness only if provided
    if (form.its_number) {
      const duplicateIts = allMembers.find(
        m => m.its_number === form.its_number && m.id !== id
      );
      if (duplicateIts) {
        toast({
          title: 'Duplicate ITS Number',
          description: 'A member with this ITS number already exists.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    try {
      const memberData = {
        ...form,
        surname: form.surname || form.name, // Use name as surname if not provided
        its_number: form.its_number || `ITS-${Date.now()}`, // Generate if not provided
      };

      if (isEditing && id) {
        await updateMember(id, memberData);
        toast({
          title: 'Member Updated',
          description: `${form.name} has been updated.`,
        });
      } else {
        await createMember(memberData);
        toast({
          title: 'Member Added',
          description: `${form.name} has been added.`,
        });
      }
      navigate('/members');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadToS3(file);
      setForm(prev => ({ ...prev, profile_photo: publicUrl }));
      toast({
        title: 'Photo Uploaded',
        description: 'Profile photo has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout title={isEditing ? 'Edit Member' : 'Add Member'} showBack onBack={() => navigate('/members')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={isEditing ? 'Edit Member' : 'Add Member'}
      showBack
      onBack={() => navigate('/members')}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />
            {form.profile_photo ? (
              <img
                src={form.profile_photo}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center ring-4 ring-border">
                {uploadingPhoto ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              {uploadingPhoto ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </label>
        </div>

        {/* Name Field - Required */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter name"
            required
          />
        </div>

        {/* Surname - Optional */}
        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input
            id="surname"
            value={form.surname}
            onChange={(e) => setForm(prev => ({ ...prev, surname: e.target.value }))}
            placeholder="Enter surname (optional)"
          />
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label>Grade</Label>
          <Select
            value={form.grade}
            onValueChange={(value) => setForm(prev => ({ ...prev, grade: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ITS Number - Optional */}
        <div className="space-y-2">
          <Label htmlFor="its_number">ITS Number</Label>
          <Input
            id="its_number"
            value={form.its_number}
            onChange={(e) => setForm(prev => ({ ...prev, its_number: e.target.value }))}
            placeholder="Enter ITS number (optional)"
          />
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobile_number">Mobile Number</Label>
          <Input
            id="mobile_number"
            type="tel"
            value={form.mobile_number}
            onChange={(e) => setForm(prev => ({ ...prev, mobile_number: e.target.value }))}
            placeholder="Enter mobile number"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter address"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div>
            <Label htmlFor="is_active" className="text-base">Active Member</Label>
            <p className="text-sm text-muted-foreground">
              Inactive members won't appear in attendance
            </p>
          </div>
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || uploadingPhoto}
          className="w-full h-12 text-base"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Member' : 'Add Member'}
        </Button>
      </form>
    </Layout>
  );
}