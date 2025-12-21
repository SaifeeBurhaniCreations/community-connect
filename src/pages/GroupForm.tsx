import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useGroups, useGroupMembers, useMembers, Group, Member } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Check, Users, UserPlus, X } from 'lucide-react';

export function GroupForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getGroup, createGroup, updateGroup } = useGroups();
  const { getGroupMembers, getAllGroupMembers, setGroupMembers } = useGroupMembers();
  const { getMembers } = useMembers();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [members, setMembersState] = useState<Member[]>([]);
  const [membersInOtherGroups, setMembersInOtherGroups] = useState<Set<string>>(new Set());
  const [existingGroup, setExistingGroup] = useState<Group | null>(null);
  const isEditing = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    memberIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setPageLoading(true);
      const [membersData, allGroupMembers] = await Promise.all([
        getMembers(),
        getAllGroupMembers()
      ]);
      setMembersState(membersData || []);

      // Get members that are already in other groups (excluding current group if editing)
      const membersInGroups = new Set<string>();
      (allGroupMembers || []).forEach(gm => {
        if (!id || gm.group_id !== id) {
          membersInGroups.add(gm.member_id);
        }
      });
      setMembersInOtherGroups(membersInGroups);

      if (id) {
        const group = await getGroup(id);
        if (group) {
          setExistingGroup(group);
          setForm(prev => ({
            ...prev,
            name: group.name,
            description: group.description || '',
          }));

          const groupMembers = await getGroupMembers(id);
          setForm(prev => ({
            ...prev,
            memberIds: (groupMembers || []).map(gm => gm.member_id),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  // Get active members who are not in other groups
  const availableMembers = members.filter(m => 
    m.is_active && !membersInOtherGroups.has(m.id)
  );
  
  const filteredMembers = availableMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.surname.toLowerCase().includes(search.toLowerCase())
  );

  // Selected members for display
  const selectedMembers = members.filter(m => form.memberIds.includes(m.id));

  const toggleMember = (memberId: string) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }));
  };

  const removeMember = (memberId: string) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.filter(id => id !== memberId)
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
      if (isEditing && id) {
        await updateGroup(id, { name: form.name, description: form.description });
        await setGroupMembers(id, form.memberIds);
        toast({
          title: 'Group Updated',
          description: `${form.name} has been updated.`,
        });
      } else {
        const newGroup = await createGroup({ name: form.name, description: form.description });
        if (newGroup && form.memberIds.length > 0) {
          await setGroupMembers(newGroup.id, form.memberIds);
        }
        toast({
          title: 'Group Created',
          description: `${form.name} has been created.`,
        });
      }
      navigate('/groups');
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

  if (pageLoading) {
    return (
      <Layout title={isEditing ? 'Edit Group' : 'Create Group'} showBack onBack={() => navigate('/groups')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={isEditing ? 'Edit Group' : 'Create Group'}
      showBack
      onBack={() => navigate('/groups')}
    >
      <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Form Content */}
        <div className="flex-1 p-4 space-y-6 pb-24">
          {/* Group Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Group Details</h3>
                <p className="text-sm text-muted-foreground">Basic information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Group Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                  className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="min-h-[80px] rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary resize-none"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          {/* Selected Members */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Selected Members</h3>
                  <p className="text-sm text-muted-foreground">{form.memberIds.length} member{form.memberIds.length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
            </div>

            {selectedMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {selectedMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="flex items-center gap-2 bg-primary/10 text-primary rounded-full pl-1 pr-3 py-1"
                    >
                      <Avatar member={member} size="xs" showHouse={false} />
                      <span className="text-sm font-medium">{member.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No members selected yet</p>
                <p className="text-xs mt-1">Select members from the list below</p>
              </div>
            )}
          </motion.div>

          {/* Member Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Available Members</h3>
                <p className="text-sm text-muted-foreground">{availableMembers.length} available to add</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Members List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 -mx-1 px-1 scrollbar-thin">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => {
                  const isSelected = form.memberIds.includes(member.id);
                  return (
                    <motion.button
                      key={member.id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <Avatar member={member} size="sm" showHouse={false} />
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-medium truncate ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {member.name} {member.surname}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          Grade {member.grade}
                        </p>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary-foreground/20' 
                          : 'bg-muted'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {availableMembers.length === 0
                      ? 'No available members'
                      : 'No members match your search'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableMembers.length === 0 && 'All members are already in other groups'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              type="submit"
              disabled={loading || !form.name}
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/25"
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isEditing ? 'Update Group' : 'Create Group'}
            </Button>
          </motion.div>
        </div>
      </form>
    </Layout>
  );
}
