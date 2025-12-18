import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useGroups, useGroupMembers, Group, Member } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, FolderOpen } from 'lucide-react';
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
  const { getGroupMembers } = useGroupMembers();

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

  if (loading) {
    return (
      <Layout title="Group Details" showBack onBack={() => navigate('/groups')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout title="Group Not Found" showBack onBack={() => navigate('/groups')}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This group does not exist.</p>
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
            onClick={() => navigate(`/groups/${group.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {group.name}. Members will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div className="p-4 space-y-6">
        {/* Group Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
              {group.description && (
                <p className="text-muted-foreground mt-1">{group.description}</p>
              )}
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="font-semibold text-foreground">Members</h3>
          {groupMembers.length > 0 ? (
            <div className="space-y-2">
              {groupMembers.map((gm, index) => {
                const member = gm.members;
                if (!member) return null;
                return (
                  <motion.div
                    key={gm.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="card-elevated p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <Avatar member={member} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.name} {member.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Grade {member.grade}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No members in this group</p>
              <Button
                variant="outline"
                className="mt-3"
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