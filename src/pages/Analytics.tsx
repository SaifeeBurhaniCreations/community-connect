import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAnalytics } from '@/hooks/useDatabase';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Award,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';

export function Analytics() {
  const { getAttendanceTrends, getGroupPerformance, getMostActiveMembers, getLeastActiveMembers } = useAnalytics();

  const [trends, setTrends] = useState<any[]>([]);
  const [groupPerformance, setGroupPerformance] = useState<any[]>([]);
  const [mostActive, setMostActive] = useState<any[]>([]);
  const [leastActive, setLeastActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendsData, performanceData, activeData, inactiveData] = await Promise.all([
        getAttendanceTrends(10),
        getGroupPerformance(),
        getMostActiveMembers(5),
        getLeastActiveMembers(5),
      ]);

      setTrends(trendsData.map(t => ({
        ...t,
        date: format(new Date(t.date), 'MMM d'),
      })));
      setGroupPerformance(performanceData);
      setMostActive(activeData);
      setLeastActive(inactiveData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="p-4 space-y-6">
          {/* Attendance Trends Skeleton */}
          <div className="card-elevated p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          
          {/* Group Comparison Skeleton */}
          <div className="card-elevated p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          
          {/* Most Active Members Skeleton */}
          <div className="card-elevated p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Needs Attention Skeleton */}
          <div className="card-elevated p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics">
      <div className="p-4 space-y-6">
        {/* Attendance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Attendance Trends
          </h2>
          {trends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(168, 84%, 26%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(168, 84%, 26%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No attendance data yet
            </div>
          )}
        </motion.div>

        {/* Group Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-4"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Group Comparison
          </h2>
          {groupPerformance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    stroke="hsl(var(--muted-foreground))"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'attendance') return [`${value}%`, 'Attendance'];
                      return [value, 'Members'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="attendance" name="Attendance %" fill="hsl(168, 84%, 26%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="memberCount" name="Members" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No groups yet
            </div>
          )}
        </motion.div>

        {/* Most Active Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-4"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-success" />
            Most Active Members
          </h2>
          {mostActive.length > 0 ? (
            <div className="space-y-3">
              {mostActive.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-yellow-950' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-amber-50' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.attended} / {member.total} occasions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-success">{member.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No attendance data yet
            </div>
          )}
        </motion.div>

        {/* Least Active Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-4"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Needs Attention
          </h2>
          {leastActive.length > 0 ? (
            <div className="space-y-3">
              {leastActive.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.attended} / {member.total} occasions attended
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      member.percentage < 50 ? 'text-destructive' : 'text-warning'
                    }`}>
                      {member.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No attendance data yet
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
