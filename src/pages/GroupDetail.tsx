import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useGroups, useGroupMembers, Group } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, FolderOpen, ChevronRight, UserMinus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getGroup, deleteGroup } = useGroups();
  const { getGroupMembers, removeMemberFromGroup } = useGroupMembers();

  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembersState] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const groupData = await getGroup(id);
      setGroup(groupData);

      if (groupData) {
        const members = await getGroupMembers(id);
        setGroupMembersState(members || []);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;
    try {
      await deleteGroup(group.id);
      toast({
        title: 'Group Deleted',
        description: `${group.name} has been removed.`,
      });
      navigate('/groups');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete group.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!group) return;
    try {
      await removeMemberFromGroup(group.id, memberId);
      toast({
        title: 'Member Removed',
        description: `${memberName} has been removed from the group.`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout title="Group Details" showBack onBack={() => navigate('/groups')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout title="Group Not Found" showBack onBack={() => navigate('/groups')}>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">This group does not exist or has been deleted.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Group Details"
      showBack
      onBack={() => navigate('/groups')}
      rightAction={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(`/groups/${group.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="rounded-full">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {group.name}. Members will not be affected and can be assigned to other groups.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-xl">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-20">
        {/* Group Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4"
        >
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
                {group.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{groupMembers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Members</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-foreground">
                  {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Created</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 mt-6 px-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Members</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => navigate(`/groups/${group.id}/edit`)}
            >
              Manage
            </Button>
          </div>

          {groupMembers.length > 0 ? (
            <div className="space-y-2">
              {groupMembers.map((gm, index) => {
                const member = gm.members;
                if (!member) return null;
                return (
                  <motion.div
                    key={gm.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.03 }}
                    className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm"
                  >
                    <div 
                      onClick={() => navigate(`/members/${member.id}`)}
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                    >
                      <Avatar member={member} size="md" showHouse />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {member.name} {member.surname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Grade {member.grade}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove {member.name} {member.surname} from {group.name}? They can be added to another group later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveMember(member.id, `${member.name} ${member.surname}`)} 
                            className="bg-destructive text-destructive-foreground rounded-xl"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No members in this group</p>
              <p className="text-sm text-muted-foreground mt-1">Add members to get started</p>
              <Button
                className="mt-4 rounded-xl"
                onClick={() => navigate(`/groups/${group.id}/edit`)}
              >
                Add Members
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
