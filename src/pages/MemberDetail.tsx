import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useMembers, useAttendance, useGroupMembers, Member } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  GraduationCap,
  CheckCircle,
  XCircle,
  TrendingUp
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
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { HouseColor } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMember, deleteMember } = useMembers();
  const { getMemberAttendanceStats, getAttendanceForMember } = useAttendance();
  const { getMemberGroups } = useGroupMembers();

  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState({ total: 0, attended: 0, percentage: 0 });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [memberGroups, setMemberGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [memberData, attendanceStats, attendance, groups] = await Promise.all([
        getMember(id!),
        getMemberAttendanceStats(id!),
        getAttendanceForMember(id!),
        getMemberGroups(id!),
      ]);

      setMember(memberData);
      setStats(attendanceStats);
      setRecentAttendance((attendance || []).slice(0, 5));
      setMemberGroups(groups || []);
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

  if (loading) {
    return (
      <Layout title="Member Details" showBack onBack={() => navigate('/members')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout title="Member Not Found" showBack onBack={() => navigate('/members')}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This member does not exist.</p>
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
            onClick={() => navigate(`/members/${member.id}/edit`)}
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
                <AlertDialogTitle>Delete Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {member.name} {member.surname} and all their attendance records.
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
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 text-center"
        >
          <Avatar member={toMemberFormat(member) as any} size="xl" showHouse />
          <h2 className="text-xl font-bold text-foreground mt-4">
            {member.name} {member.surname}
          </h2>
          <p className="text-muted-foreground">ITS: {member.its_number}</p>
          {!member.is_active && (
            <span className="inline-block mt-2 px-3 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
              Inactive
            </span>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-4"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Attendance Stats
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Attendance Rate</span>
                <span className="font-semibold text-foreground">{stats.percentage}%</span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">{stats.attended}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{stats.total - stats.attended}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="card-elevated p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade & Class</p>
              <p className="font-medium text-foreground">Grade {member.grade} • Class {member.class}</p>
            </div>
          </div>

          {member.mobile_number && (
            <div className="card-elevated p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <a href={`tel:${member.mobile_number}`} className="font-medium text-foreground">
                  {member.mobile_number}
                </a>
              </div>
            </div>
          )}

          {member.address && (
            <div className="card-elevated p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-foreground">{member.address}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Groups */}
        {memberGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-4"
          >
            <h3 className="font-semibold text-foreground mb-3">Groups</h3>
            <div className="flex flex-wrap gap-2">
              {memberGroups.map((gm: any) => (
                <span
                  key={gm.id}
                  onClick={() => navigate(`/groups/${gm.groups?.id}`)}
                  className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  {gm.groups?.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Attendance */}
        {recentAttendance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-4"
          >
            <h3 className="font-semibold text-foreground mb-3">Recent Attendance</h3>
            <div className="space-y-2">
              {recentAttendance.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                >
                  {record.is_present ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {record.occasions?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.occasions?.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
