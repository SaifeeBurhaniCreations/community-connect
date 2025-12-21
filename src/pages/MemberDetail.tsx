import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useMembers, useAttendance, useGroupMembers, useGroups, Member, Group } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  GraduationCap,
  CheckCircle,
  XCircle,
  TrendingUp,
  FolderOpen,
  ChevronRight,
  UserPlus
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { HouseColor } from '@/types';

export function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMember, deleteMember } = useMembers();
  const { getMemberAttendanceStats, getAttendanceForMember } = useAttendance();
  const { getMemberGroups, addMemberToGroup, removeMemberFromGroup } = useGroupMembers();
  const { getGroups } = useGroups();

  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState({ total: 0, attended: 0, percentage: 0 });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [memberGroups, setMemberGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [changingGroup, setChangingGroup] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [memberData, attendanceStats, attendance, groups, allGroupsData] = await Promise.all([
        getMember(id!),
        getMemberAttendanceStats(id!),
        getAttendanceForMember(id!),
        getMemberGroups(id!),
        getGroups(),
      ]);

      setMember(memberData);
      setStats(attendanceStats);
      setRecentAttendance((attendance || []).slice(0, 5));
      setMemberGroups(groups || []);
      setAllGroups(allGroupsData || []);
    } catch (error) {
      console.error('Error loading member:', error);
    } finally {
      setLoading(false);
    }
  };

  const toMemberFormat = (m: Member) => ({
    ...m,
    houseColor: m.house_color as HouseColor,
    itsNumber: m.its_number,
    mobileNumber: m.mobile_number,
    profilePhoto: m.profile_photo,
    isActive: m.is_active,
    createdAt: m.created_at,
  });

  const handleDelete = async () => {
    if (!member) return;
    
    try {
      await deleteMember(member.id);
      toast({
        title: 'Member Deleted',
        description: `${member.name} ${member.surname} has been removed.`,
      });
      navigate('/members');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete member.',
        variant: 'destructive',
      });
    }
  };

  const handleChangeGroup = async (newGroupId: string) => {
    if (!member) return;
    
    try {
      setChangingGroup(true);
      
      // Remove from current group if any
      if (memberGroups.length > 0) {
        await removeMemberFromGroup(memberGroups[0].group_id, member.id);
      }
      
      // Add to new group
      await addMemberToGroup(newGroupId, member.id);
      
      toast({
        title: 'Group Changed',
        description: `${member.name} has been moved to the new group.`,
      });
      
      setGroupDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change group.',
        variant: 'destructive',
      });
    } finally {
      setChangingGroup(false);
    }
  };

  const handleRemoveFromGroup = async () => {
    if (!member || memberGroups.length === 0) return;
    
    try {
      setChangingGroup(true);
      await removeMemberFromGroup(memberGroups[0].group_id, member.id);
      
      toast({
        title: 'Removed from Group',
        description: `${member.name} is no longer in any group.`,
      });
      
      setGroupDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from group.',
        variant: 'destructive',
      });
    } finally {
      setChangingGroup(false);
    }
  };

  const currentGroup = memberGroups.length > 0 ? memberGroups[0].groups : null;
  const availableGroups = allGroups.filter(g => g.id !== currentGroup?.id);

  if (loading) {
    return (
      <Layout title="Member Details" showBack onBack={() => navigate('/members')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout title="Member Not Found" showBack onBack={() => navigate('/members')}>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">This member does not exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/members')}>
            Back to Members
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Member Details"
      showBack
      onBack={() => navigate('/members')}
      rightAction={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(`/members/${member.id}/edit`)}
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
                <AlertDialogTitle>Delete Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {member.name} {member.surname} and all their attendance records.
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
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4"
        >
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 text-center border border-primary/10">
            <Avatar member={toMemberFormat(member) as any} size="xl" showHouse />
            <h2 className="text-2xl font-bold text-foreground mt-4">
              {member.name} {member.surname}
            </h2>
            <p className="text-muted-foreground">ITS: {member.its_number}</p>
            {!member.is_active && (
              <span className="inline-block mt-3 px-4 py-1.5 bg-destructive/10 text-destructive text-sm font-medium rounded-full">
                Inactive
              </span>
            )}
          </div>
        </motion.div>

        {/* Group Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-4 mt-4"
        >
          <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
            <DialogTrigger asChild>
              <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    currentGroup ? 'bg-green-500/10' : 'bg-orange-500/10'
                  }`}>
                    <FolderOpen className={`w-6 h-6 ${
                      currentGroup ? 'text-green-500' : 'text-orange-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Group</p>
                    <p className="font-semibold text-foreground">
                      {currentGroup ? currentGroup.name : 'Not assigned'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle>Change Group</DialogTitle>
                <DialogDescription>
                  {currentGroup 
                    ? `Currently in: ${currentGroup.name}`
                    : 'Select a group to assign this member'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                {availableGroups.length > 0 ? (
                  availableGroups.map((group) => (
                    <button
                      key={group.id}
                      disabled={changingGroup}
                      onClick={() => handleChangeGroup(group.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{group.name}</p>
                        {group.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No other groups available</p>
                  </div>
                )}
              </div>
              {currentGroup && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 rounded-xl text-destructive hover:text-destructive"
                  onClick={handleRemoveFromGroup}
                  disabled={changingGroup}
                >
                  Remove from current group
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 mt-4"
        >
          <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Attendance Stats</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-bold text-foreground">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-3 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.attended}</p>
                  <p className="text-xs text-muted-foreground mt-1">Present</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{stats.total - stats.attended}</p>
                  <p className="text-xs text-muted-foreground mt-1">Absent</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-4 mt-4 space-y-3"
        >
          <div className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade & Class</p>
              <p className="font-semibold text-foreground">Grade {member.grade} • Class {member.class}</p>
            </div>
          </div>

          {member.mobile_number && (
            <a href={`tel:${member.mobile_number}`} className="block">
              <div className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm active:scale-[0.98] transition-transform">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold text-foreground">{member.mobile_number}</p>
                </div>
              </div>
            </a>
          )}

          {member.address && (
            <div className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold text-foreground truncate">{member.address}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Attendance */}
        {recentAttendance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-4 mt-4"
          >
            <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Recent Attendance</h3>
              <div className="space-y-2">
                {recentAttendance.map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                  >
                    {record.is_present ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {record.occasions?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.occasions?.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
