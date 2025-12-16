import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Avatar } from '@/components/Avatar';
import { 
  Users, 
  FolderOpen, 
  Calendar, 
  TrendingUp,
  UserCheck,
  UserX,
  ChevronRight,
  Plus
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
  Tooltip
} from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const { members, groups, occasions, attendance } = useStore();

  const activeMembers = members.filter(m => m.isActive).length;
  const totalOccasions = occasions.length;
  
  // Calculate attendance stats
  const lastOccasion = occasions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  
  const lastOccasionAttendance = lastOccasion 
    ? attendance.filter(a => a.occasionId === lastOccasion.id)
    : [];
  const presentCount = lastOccasionAttendance.filter(a => a.isPresent).length;
  const absentCount = lastOccasionAttendance.filter(a => !a.isPresent).length;
  const attendanceRate = lastOccasionAttendance.length > 0 
    ? Math.round((presentCount / lastOccasionAttendance.length) * 100) 
    : 0;

  const pieData = [
    { name: 'Present', value: presentCount || 1, color: 'hsl(142, 76%, 36%)' },
    { name: 'Absent', value: absentCount || 1, color: 'hsl(0, 84%, 60%)' },
  ];

  // Group attendance data
  const groupAttendance = groups.map(group => {
    const groupMemberIds = new Set(group.memberIds);
    const groupAttendanceRecords = attendance.filter(a => groupMemberIds.has(a.memberId));
    const present = groupAttendanceRecords.filter(a => a.isPresent).length;
    const total = groupAttendanceRecords.length;
    return {
      name: group.name.length > 8 ? group.name.slice(0, 8) + '...' : group.name,
      attendance: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }).slice(0, 5);

  const stats = [
    { label: 'Members', value: activeMembers, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Groups', value: groups.length, icon: FolderOpen, color: 'bg-accent/10 text-accent' },
    { label: 'Occasions', value: totalOccasions, icon: Calendar, color: 'bg-info/10 text-info' },
    { label: 'Attendance', value: `${attendanceRate}%`, icon: TrendingUp, color: 'bg-success/10 text-success' },
  ];

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
          {stats.map((stat, index) => (
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
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
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
                <span className="ml-auto font-semibold text-foreground">{presentCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Absent</span>
                <span className="ml-auto font-semibold text-foreground">{absentCount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Group Attendance */}
        {groupAttendance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-elevated p-4"
          >
            <h2 className="font-semibold text-foreground mb-4">Group Performance</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupAttendance} layout="vertical">
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
                  <Avatar member={member} size="sm" />
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
    </div>
  );
}
