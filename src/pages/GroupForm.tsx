import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Check } from 'lucide-react';

export function GroupForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { members, addGroup, updateGroup, getGroup } = useStore();

  const existingGroup = id ? getGroup(id) : undefined;
  const isEditing = !!existingGroup;

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: existingGroup?.name || '',
    description: existingGroup?.description || '',
    memberIds: existingGroup?.memberIds || [] as string[],
  });

  const activeMembers = members.filter(m => m.isActive);
  const filteredMembers = activeMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.surname.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name) {
      toast({
        title: 'Missing Name',
        description: 'Please enter a group name.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        updateGroup(id!, form);
        toast({
          title: 'Group Updated',
          description: `${form.name} has been updated.`,
        });
      } else {
        addGroup(form);
        toast({
          title: 'Group Created',
          description: `${form.name} has been created.`,
        });
      }
      navigate('/groups');
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

  return (
    <Layout
      title={isEditing ? 'Edit Group' : 'Create Group'}
      showBack
      onBack={() => navigate('/groups')}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Group Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter group name"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description..."
            rows={3}
          />
        </div>

        {/* Member Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Select Members</Label>
            <span className="text-sm text-muted-foreground">
              {form.memberIds.length} selected
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="max-h-64 overflow-y-auto space-y-2 -mx-2 px-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isSelected = form.memberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary'
                    }`}
                  >
                    <Avatar member={member} size="sm" showHouse={false} />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.name} {member.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Grade {member.grade}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-center py-4 text-muted-foreground text-sm">
                {activeMembers.length === 0
                  ? 'No active members available'
                  : 'No members match your search'}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Group' : 'Create Group'}
        </Button>
      </form>
    </Layout>
  );
}
