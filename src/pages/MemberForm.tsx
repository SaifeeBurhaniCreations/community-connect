import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { HouseColor, Member, HOUSE_COLORS, GRADES, CLASSES } from '@/types';
import { Camera, Loader2 } from 'lucide-react';

export function MemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { members, addMember, updateMember, getMember } = useStore();
  
  const existingMember = id ? getMember(id) : undefined;
  const isEditing = !!existingMember;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: existingMember?.name || '',
    surname: existingMember?.surname || '',
    houseColor: existingMember?.houseColor || 'red' as HouseColor,
    address: existingMember?.address || '',
    itsNumber: existingMember?.itsNumber || '',
    mobileNumber: existingMember?.mobileNumber || '',
    grade: existingMember?.grade || '1',
    class: existingMember?.class || 'A',
    profilePhoto: existingMember?.profilePhoto || '',
    isActive: existingMember?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate ITS number uniqueness
    const duplicateIts = members.find(
      m => m.itsNumber === form.itsNumber && m.id !== id
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

    // Validate required fields
    if (!form.name || !form.surname || !form.itsNumber) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        updateMember(id!, form);
        toast({
          title: 'Member Updated',
          description: `${form.name} ${form.surname} has been updated.`,
        });
      } else {
        addMember(form);
        toast({
          title: 'Member Added',
          description: `${form.name} ${form.surname} has been added.`,
        });
      }
      navigate('/members');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
            />
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center ring-4 ring-border">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
          </label>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">First Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={form.surname}
              onChange={(e) => setForm(prev => ({ ...prev, surname: e.target.value }))}
              placeholder="Enter surname"
              required
            />
          </div>
        </div>

        {/* ITS Number */}
        <div className="space-y-2">
          <Label htmlFor="itsNumber">ITS Number *</Label>
          <Input
            id="itsNumber"
            value={form.itsNumber}
            onChange={(e) => setForm(prev => ({ ...prev, itsNumber: e.target.value }))}
            placeholder="Enter ITS number"
            required
          />
        </div>

        {/* House Color */}
        <div className="space-y-2">
          <Label>House Color *</Label>
          <div className="grid grid-cols-4 gap-2">
            {HOUSE_COLORS.map(({ value, label, className }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, houseColor: value }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  form.houseColor === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${className}`} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grade & Class */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Grade *</Label>
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
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Class *</Label>
            <Select
              value={form.class}
              onValueChange={(value) => setForm(prev => ({ ...prev, class: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={form.mobileNumber}
            onChange={(e) => setForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
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
            <Label htmlFor="isActive" className="text-base">Active Member</Label>
            <p className="text-sm text-muted-foreground">
              Inactive members won't appear in attendance
            </p>
          </div>
          <Switch
            id="isActive"
            checked={form.isActive}
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Member' : 'Add Member'}
        </Button>
      </form>
    </Layout>
  );
}
