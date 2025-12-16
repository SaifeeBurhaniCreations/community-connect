import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Calendar,
  Music,
  Users,
  UserCheck
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
import { format } from 'date-fns';

export function OccasionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getOccasion, deleteOccasion, getGroup, getAttendanceForOccasion } = useStore();

  const occasion = id ? getOccasion(id) : undefined;

  if (!occasion) {
    return (
      <Layout title="Occasion Not Found" showBack onBack={() => navigate('/occasions')}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This occasion does not exist.</p>
        </div>
      </Layout>
    );
  }

  const attendance = getAttendanceForOccasion(occasion.id);
  const presentCount = attendance.filter(a => a.isPresent).length;

  const handleDelete = () => {
    deleteOccasion(occasion.id);
    toast({
      title: 'Occasion Deleted',
      description: `${occasion.title} has been removed.`,
    });
    navigate('/occasions');
  };

  return (
    <Layout
      title="Occasion Details"
      showBack
      onBack={() => navigate('/occasions')}
      rightAction={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/occasions/${occasion.id}/edit`)}
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
                <AlertDialogTitle>Delete Occasion?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {occasion.title} and all attendance records.
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
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <h2 className="text-xl font-bold text-foreground">{occasion.title}</h2>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(occasion.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{occasion.startTime} - {occasion.endTime}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{occasion.place}</span>
            </div>
          </div>

          {occasion.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{occasion.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Attendance Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={() => navigate(`/occasions/${occasion.id}/attendance`)}
            className="w-full h-14 text-base"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Mark Attendance
            {attendance.length > 0 && (
              <span className="ml-auto bg-primary-foreground/20 px-2 py-0.5 rounded-full text-sm">
                {presentCount} present
              </span>
            )}
          </Button>
        </motion.div>

        {/* Kalam Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Kalam List ({occasion.kalamAssignments.length})
          </h3>
          
          {occasion.kalamAssignments.length > 0 ? (
            <div className="space-y-2">
              {occasion.kalamAssignments.map((kalam, index) => {
                const group = getGroup(kalam.groupId);
                return (
                  <motion.div
                    key={kalam.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full mb-1">
                          {kalam.kalamType}
                        </span>
                        <h4 className="font-medium text-foreground truncate">
                          {kalam.kalamName || 'Untitled Kalam'}
                        </h4>
                        {group && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{group.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-xl">
              <Music className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No kalam assigned</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => navigate(`/occasions/${occasion.id}/edit`)}
              >
                Add Kalam
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
