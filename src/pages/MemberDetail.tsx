import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Hash, 
  GraduationCap,
  Calendar,
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

export function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMember, deleteMember, getMemberAttendanceStats, getAttendanceForMember, occasions, groups } = useStore();

  const member = id ? getMember(id) : undefined;

  if (!member) {
    return (
      <Layout title="Member Not Found" showBack onBack={() => navigate('/members')}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This member does not exist.</p>
        </div>
      </Layout>
    );
  }

  const stats = getMemberAttendanceStats(member.id);
  const memberAttendance = getAttendanceForMember(member.id);
  const memberGroups = groups.filter(g => g.memberIds.includes(member.id));

  // Get recent attendance with occasion details
  const recentAttendance = memberAttendance
    .map(a => ({
      ...a,
      occasion: occasions.find(o => o.id === a.occasionId)
    }))
    .filter(a => a.occasion)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const handleDelete = () => {
    deleteMember(member.id);
    toast({
      title: 'Member Deleted',
      description: `${member.name} ${member.surname} has been removed.`,
    });
    navigate('/members');
  };

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
          <Avatar member={member} size="xl" showHouse />
          <h2 className="text-xl font-bold text-foreground mt-4">
            {member.name} {member.surname}
          </h2>
          <p className="text-muted-foreground">ITS: {member.itsNumber}</p>
          {!member.isActive && (
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

          {member.mobileNumber && (
            <div className="card-elevated p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <a href={`tel:${member.mobileNumber}`} className="font-medium text-foreground">
                  {member.mobileNumber}
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
              {memberGroups.map(group => (
                <span
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  {group.name}
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
              {recentAttendance.map(record => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                >
                  {record.isPresent ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {record.occasion?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.occasion?.date}
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
