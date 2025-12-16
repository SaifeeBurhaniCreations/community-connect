import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, X, Users } from 'lucide-react';

export function AttendanceMarking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    getOccasion, 
    members, 
    groups, 
    attendance, 
    markAttendance,
    getAttendanceForOccasion 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | 'all'>('all');

  const occasion = id ? getOccasion(id) : undefined;
  const occasionAttendance = id ? getAttendanceForOccasion(id) : [];

  const activeMembers = members.filter(m => m.isActive);

  // Get groups that have members assigned to this occasion's kalam
  const relevantGroupIds = new Set(
    occasion?.kalamAssignments.map(k => k.groupId).filter(Boolean) || []
  );
  const relevantGroups = groups.filter(g => relevantGroupIds.has(g.id));

  // Filter and group members
  const filteredMembers = useMemo(() => {
    let filtered = activeMembers;

    // Filter by search
    if (search) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.surname.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by group
    if (selectedGroup !== 'all') {
      const group = groups.find(g => g.id === selectedGroup);
      if (group) {
        filtered = filtered.filter(m => group.memberIds.includes(m.id));
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeMembers, search, selectedGroup, groups]);

  // Group members by their groups for display
  const membersByGroup = useMemo(() => {
    if (selectedGroup !== 'all') {
      return { [selectedGroup]: filteredMembers };
    }

    const grouped: Record<string, typeof filteredMembers> = {};
    
    // First, add members to their respective relevant groups
    relevantGroups.forEach(group => {
      const groupMembers = filteredMembers.filter(m => group.memberIds.includes(m.id));
      if (groupMembers.length > 0) {
        grouped[group.id] = groupMembers;
      }
    });

    // Add ungrouped members
    const groupedMemberIds = new Set(
      Object.values(grouped).flat().map(m => m.id)
    );
    const ungrouped = filteredMembers.filter(m => !groupedMemberIds.has(m.id));
    if (ungrouped.length > 0) {
      grouped['ungrouped'] = ungrouped;
    }

    return grouped;
  }, [filteredMembers, selectedGroup, relevantGroups]);

  if (!occasion) {
    return (
      <Layout title="Occasion Not Found" showBack onBack={() => navigate('/occasions')}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This occasion does not exist.</p>
        </div>
      </Layout>
    );
  }

  const getAttendanceStatus = (memberId: string) => {
    const record = occasionAttendance.find(a => a.memberId === memberId);
    return record?.isPresent;
  };

  const handleToggle = (memberId: string) => {
    const currentStatus = getAttendanceStatus(memberId);
    markAttendance(memberId, occasion.id, currentStatus !== true);
  };

  const presentCount = occasionAttendance.filter(a => a.isPresent).length;
  const totalMarked = occasionAttendance.length;

  return (
    <Layout
      title="Mark Attendance"
      showBack
      onBack={() => navigate(`/occasions/${occasion.id}`)}
    >
      <div className="p-4 space-y-4">
        {/* Stats Bar */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Occasion</p>
            <p className="font-medium text-foreground truncate">{occasion.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-success">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-destructive">{totalMarked - presentCount}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Group Filter */}
        {relevantGroups.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGroup === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              All
            </button>
            {relevantGroups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGroup === group.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        {/* Members List */}
        <div className="space-y-6">
          {Object.entries(membersByGroup).map(([groupId, groupMembers]) => {
            const group = groups.find(g => g.id === groupId);
            const groupName = groupId === 'ungrouped' ? 'Other Members' : group?.name || 'Unknown';

            return (
              <div key={groupId}>
                {/* Group Header */}
                {(selectedGroup === 'all' || groupId === 'ungrouped') && Object.keys(membersByGroup).length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-muted-foreground text-sm">{groupName}</h3>
                    <span className="text-xs text-muted-foreground">({groupMembers.length})</span>
                  </div>
                )}

                {/* Members */}
                <div className="grid grid-cols-1 gap-2">
                  {groupMembers.map((member) => {
                    const status = getAttendanceStatus(member.id);
                    
                    return (
                      <motion.button
                        key={member.id}
                        onClick={() => handleToggle(member.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl flex items-center gap-4 transition-all border-2 ${
                          status === true
                            ? 'bg-success/10 border-success'
                            : status === false
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        <Avatar member={member} size="md" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {member.name} {member.surname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Grade {member.grade}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          status === true
                            ? 'bg-success text-success-foreground'
                            : status === false
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {status === true ? (
                            <Check className="w-5 h-5" />
                          ) : status === false ? (
                            <X className="w-5 h-5" />
                          ) : (
                            <span className="text-lg">?</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
