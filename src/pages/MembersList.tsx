import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useMembers, useGroupMembers, useGroups, useAttendance, Member } from '@/hooks/useDatabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, UserX, Users, UserCheck, ChevronRight } from 'lucide-react';
import { HouseColor } from '@/types';

const GRADE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'Z': { bg: 'bg-amber-500', text: 'text-amber-500', label: 'Z - Elite' },
  'A': { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'A - Advanced' },
  'B': { bg: 'bg-blue-500', text: 'text-blue-500', label: 'B - Intermediate' },
  'C': { bg: 'bg-purple-500', text: 'text-purple-500', label: 'C - Developing' },
  'D': { bg: 'bg-slate-400', text: 'text-slate-400', label: 'D - Beginner' },
};

export function MembersList() {
  const navigate = useNavigate();
  const { getMembers } = useMembers();
  const { getAllGroupMembers } = useGroupMembers();
  const { getGroups } = useGroups();
  const { getMemberAttendanceStats } = useAttendance();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupMemberships, setGroupMemberships] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [attendanceStats, setAttendanceStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, groupMembersData, groupsData] = await Promise.all([
        getMembers(),
        getAllGroupMembers(),
        getGroups(),
      ]);
      
      setMembers(membersData || []);
      
      // Build group lookup
      const groupLookup: Record<string, string> = {};
      (groupsData || []).forEach(g => {
        groupLookup[g.id] = g.name;
      });
      setGroups(groupLookup);
      
      // Build member -> group mapping
      const memberGroupMap: Record<string, string> = {};
      (groupMembersData || []).forEach(gm => {
        memberGroupMap[gm.member_id] = gm.group_id;
      });
      setGroupMemberships(memberGroupMap);
      
      // Load attendance stats for each member
      const statsMap: Record<string, number> = {};
      const activeMembers = (membersData || []).filter(m => m.is_active);
      await Promise.all(
        activeMembers.map(async (member) => {
          const stats = await getMemberAttendanceStats(member.id);
          if (stats && stats.total > 0) {
            statsMap[member.id] = Math.round((stats.attended / stats.total) * 100);
          } else {
            statsMap[member.id] = -1; // No data
          }
        })
      );
      setAttendanceStats(statsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeMembers = useMemo(() => members.filter(m => m.is_active), [members]);
  const inactiveMembers = useMemo(() => members.filter(m => !m.is_active), [members]);

  const filteredMembers = useMemo(() => {
    return activeMembers
      .filter(m => {
        const matchesSearch = 
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.surname.toLowerCase().includes(search.toLowerCase()) ||
          m.its_number.includes(search);
        const matchesGrade = filterGrade === 'all' || m.grade === filterGrade;
        return matchesSearch && matchesGrade;
      })
      .sort((a, b) => {
        // Sort by grade first (Z, A, B, C, D)
        const gradeOrder = ['Z', 'A', 'B', 'C', 'D'];
        const gradeCompare = gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        if (gradeCompare !== 0) return gradeCompare;
        return a.name.localeCompare(b.name);
      });
  }, [activeMembers, search, filterGrade]);

  const toMemberFormat = (m: Member) => ({
    ...m,
    houseColor: m.house_color as HouseColor,
    itsNumber: m.its_number,
    mobileNumber: m.mobile_number,
    profilePhoto: m.profile_photo,
    isActive: m.is_active,
    createdAt: m.created_at,
  });

  const getAttendanceColor = (percentage: number) => {
    if (percentage === -1) return 'text-muted-foreground';
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Layout title="Members">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Members"
      rightAction={
        <Button
          onClick={() => navigate('/members/new')}
          size="icon"
          className="bg-primary text-primary-foreground rounded-full w-10 h-10 shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </Button>
      }
    >
      <div className="flex flex-col h-full">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-4 pb-2"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inactiveMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 py-3 space-y-3"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ITS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-0 rounded-xl h-11"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 w-11 h-11 rounded-xl"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Grade Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 flex-wrap pb-1">
                  <button
                    onClick={() => setFilterGrade('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterGrade === 'all'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All Grades
                  </button>
                  {Object.entries(GRADE_COLORS).map(([grade, { bg, label }]) => (
                    <button
                      key={grade}
                      onClick={() => setFilterGrade(grade)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        filterGrade === grade
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />
                      {grade}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
          </p>
        </motion.div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="space-y-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => {
                const gradeColor = GRADE_COLORS[member.grade] || GRADE_COLORS['D'];
                const groupId = groupMemberships[member.id];
                const groupName = groupId ? groups[groupId] : null;
                const attendance = attendanceStats[member.id];
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="bg-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30"
                  >
                    <div className="relative">
                      <Avatar member={toMemberFormat(member) as any} size="lg" />
                      {/* Grade indicator dot */}
                      <div className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full ${gradeColor.bg} border-2 border-card flex items-center justify-center`}>
                        <span className="text-[8px] font-bold text-white">{member.grade}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.name} {member.surname}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ITS: {member.its_number}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {groupName ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {groupName}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            No Group
                          </span>
                        )}
                        <span className={`text-xs font-medium ${getAttendanceColor(attendance)}`}>
                          {attendance === -1 ? 'No data' : `${attendance}% attendance`}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <UserX className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No members found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {search || filterGrade !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first member to get started'}
                </p>
                {!search && filterGrade === 'all' && (
                  <Button 
                    onClick={() => navigate('/members/new')}
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
