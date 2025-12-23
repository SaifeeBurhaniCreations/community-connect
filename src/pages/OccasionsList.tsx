import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useOccasions, useAttendance, Occasion } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, MapPin, Clock, Music } from 'lucide-react';
import { format } from 'date-fns';

export function OccasionsList() {
  const navigate = useNavigate();
  const { getOccasions } = useOccasions();
  const { getAttendanceForOccasion } = useAttendance();
  
  const [occasions, setOccasions] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { present: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const occasionsData = await getOccasions();
      setOccasions(occasionsData || []);

      // Load attendance for each occasion
      const attMap: Record<string, { present: number; total: number }> = {};
      for (const occasion of (occasionsData || [])) {
        const attendance = await getAttendanceForOccasion(occasion.id);
        const present = attendance?.filter(a => a.is_present).length || 0;
        attMap[occasion.id] = { present, total: attendance?.length || 0 };
      }
      setAttendanceMap(attMap);
    } catch (error) {
      console.error('Error loading occasions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout
        title="Occasions"
        rightAction={
          <Button
            onClick={() => navigate('/occasions/new')}
            size="icon"
            className="bg-primary text-primary-foreground rounded-full w-10 h-10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        }
      >
        <div className="p-4 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Occasions"
      rightAction={
        <Button
          onClick={() => navigate('/occasions/new')}
          size="icon"
          className="bg-primary text-primary-foreground rounded-full w-10 h-10"
        >
          <Plus className="w-5 h-5" />
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          {occasions.length} occasion{occasions.length !== 1 ? 's' : ''}
        </p>

        {occasions.length > 0 ? (
          <div className="space-y-3">
            {occasions.map((occasion, index) => {
              const att = attendanceMap[occasion.id] || { present: 0, total: 0 };
              const kalamCount = occasion.kalam_assignments?.length || 0;

              return (
                <motion.div
                  key={occasion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => navigate(`/occasions/${occasion.id}`)}
                  className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-primary uppercase">
                        {format(new Date(occasion.date), 'MMM')}
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {format(new Date(occasion.date), 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{occasion.title}</h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{occasion.place}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{occasion.start_time} - {occasion.end_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Music className="w-3 h-3" />
                      <span>{kalamCount} Kalam</span>
                    </div>
                    {att.total > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-success font-medium">{att.present}</span>
                        <span className="text-muted-foreground">present</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No occasions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first occasion to get started
            </p>
            <Button onClick={() => navigate('/occasions/new')}>
              <Plus className="w-4 h-4 mr-2" /> Create Occasion
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}