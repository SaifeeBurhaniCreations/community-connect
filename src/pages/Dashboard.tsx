import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics, useMembers, useOccasions, useAttendance, useGroupMembers } from '@/hooks/useDatabase';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FolderOpen, 
  Calendar, 
  TrendingUp,
  UserCheck,
  UserX,
  ChevronRight,
  Plus,
  BarChart3,
  UserMinus
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BottomNav } from '@/components/BottomNav';

const GRADE_CONFIG: Record<string, { label: string; color: string }> = {
  'Z': { label: 'Elite', color: 'hsl(45, 93%, 47%)' },
  'A': { label: 'Excellent', color: 'hsl(142, 76%, 36%)' },
  'B': { label: 'Good', color: 'hsl(217, 91%, 60%)' },
  'C': { label: 'Average', color: 'hsl(38, 92%, 50%)' },
  'D': { label: 'Beginner', color: 'hsl(0, 84%, 60%)' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardStats, getGroupPerformance, getAttendanceTrends } = useAnalytics();
  const { getMembers } = useMembers();
  const { getOccasions } = useOccasions();
  const { getAttendanceForOccasion } = useAttendance();
  const { getAllGroupMembers } = useGroupMembers();

  const [stats, setStats] = useState({ totalMembers: 0, totalGroups: 0, totalOccasions: 0 });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [lastOccasion, setLastOccasion] = useState<any>(null);
  const [lastOccasionAttendance, setLastOccasionAttendance] = useState<{ present: number; absent: number }>({ present: 0, absent: 0 });
  const [groupPerformance, setGroupPerformance] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [attendanceTrends, setAttendanceTrends] = useState<any[]>([]);
  const [unassignedMembers, setUnassignedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [dashStats, members, occasions, performance, trends, groupMembersData] = await Promise.all([
        getDashboardStats(),
        getMembers(),
        getOccasions(),
        getGroupPerformance(),
        getAttendanceTrends(5),
        getAllGroupMembers(),
      ]);

      setStats(dashStats);
      setRecentMembers((members || []).slice(0, 5));
      setGroupPerformance(performance.slice(0, 5));
      setAttendanceTrends(trends);

      // Calculate grade distribution
      const gradeCount: Record<string, number> = {};
      (members || []).forEach((member: any) => {
        const grade = member.grade || 'D';
        gradeCount[grade] = (gradeCount[grade] || 0) + 1;
      });
      
      const gradeData = Object.entries(gradeCount)
        .map(([grade, count]) => ({
          grade,
          count,
          label: GRADE_CONFIG[grade]?.label || grade,
          color: GRADE_CONFIG[grade]?.color || 'hsl(var(--muted))',
        }))
        .sort((a, b) => {
          const order = ['Z', 'A', 'B', 'C', 'D'];
          return order.indexOf(a.grade) - order.indexOf(b.grade);
        });
      setGradeDistribution(gradeData);

      // Find unassigned members
      const assignedMemberIds = new Set((groupMembersData || []).map(gm => gm.member_id));
      const unassigned = (members || []).filter((m: any) => !assignedMemberIds.has(m.id));
      setUnassignedMembers(unassigned);

      // Get last occasion and its attendance
      if (occasions && occasions.length > 0) {
        const last = occasions[0];
        setLastOccasion(last);
        
        const attendance = await getAttendanceForOccasion(last.id);
        const present = attendance?.filter(a => a.is_present).length || 0;
        const absent = attendance?.filter(a => !a.is_present).length || 0;
        setLastOccasionAttendance({ present, absent });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = lastOccasionAttendance.present + lastOccasionAttendance.absent > 0
    ? Math.round((lastOccasionAttendance.present / (lastOccasionAttendance.present + lastOccasionAttendance.absent)) * 100)
    : 0;

  const pieData = [
    { name: 'Present', value: lastOccasionAttendance.present || 1, color: 'hsl(142, 76%, 36%)' },
    { name: 'Absent', value: lastOccasionAttendance.absent || 1, color: 'hsl(0, 84%, 60%)' },
  ];

  const statCards = [
    { label: 'Members', value: stats.totalMembers, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Groups', value: stats.totalGroups, icon: FolderOpen, color: 'bg-accent/10 text-accent' },
    { label: 'Occasions', value: stats.totalOccasions, icon: Calendar, color: 'bg-info/10 text-info' },
    { label: 'Attendance', value: `${attendanceRate}%`, icon: TrendingUp, color: 'bg-success/10 text-success' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header Skeleton */}
        <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8 rounded-b-3xl">
          <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
          <Skeleton className="h-8 w-40 mt-2 bg-primary-foreground/20" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="px-4 mt-6 space-y-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-primary-foreground/70 text-sm">Welcome back</p>
          <h1 className="text-2xl font-bold mt-1">Majlis Manager</h1>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
              className="card-elevated p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="px-4 mt-6 space-y-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex gap-3"
        >
          <button
            onClick={() => navigate('/analytics')}
            className="flex-1 card-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <span className="font-medium text-foreground">View Analytics</span>
          </button>
        </motion.div>

        {/* Unassigned Members Alert */}
        {unassignedMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="card-elevated p-4 border-l-4 border-l-warning"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-warning" />
                <h2 className="font-semibold text-foreground">Unassigned Members</h2>
              </div>
              <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-medium">
                {unassignedMembers.length}
              </span>
            </div>
            <div className="space-y-2">
              {unassignedMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <Avatar member={member as any} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">Grade {member.grade}</p>
                  </div>
                </div>
              ))}
              {unassignedMembers.length > 3 && (
                <button
                  onClick={() => navigate('/members')}
                  className="text-primary text-sm font-medium flex items-center gap-1 mt-2"
                >
                  +{unassignedMembers.length - 3} more <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Grade Distribution */}
        {gradeDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card-elevated p-4"
          >
            <h2 className="font-semibold text-foreground mb-4">Grade Distribution</h2>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {gradeDistribution.map((grade) => (
                  <div key={grade.grade} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: grade.color }}
                    />
                    <span className="text-sm text-muted-foreground flex-1">
                      {grade.grade} - {grade.label}
                    </span>
                    <span className="font-semibold text-foreground text-sm">{grade.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Attendance Trends */}
        {attendanceTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="card-elevated p-4"
          >
            <h2 className="font-semibold text-foreground mb-4">Attendance Trends</h2>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => value.slice(0, 6)}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(168, 84%, 26%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(168, 84%, 26%)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Last Occasion</h2>
            {lastOccasion && (
              <span className="text-xs text-muted-foreground">{lastOccasion.title}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Present</span>
                <span className="ml-auto font-semibold text-foreground">{lastOccasionAttendance.present}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Absent</span>
                <span className="ml-auto font-semibold text-foreground">{lastOccasionAttendance.absent}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Group Performance */}
        {groupPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="card-elevated p-4"
          >
            <h2 className="font-semibold text-foreground mb-4">Group Performance</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupPerformance.map(g => ({ name: g.name.slice(0, 8), attendance: g.attendance }))} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="attendance" fill="hsl(168, 84%, 26%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Recent Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Members</h2>
            <button 
              onClick={() => navigate('/members')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {recentMembers.length > 0 ? (
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <Avatar member={member as any} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">Grade {member.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No members yet</p>
              <button
                onClick={() => navigate('/members/new')}
                className="mt-3 inline-flex items-center gap-2 text-primary text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add first member
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
