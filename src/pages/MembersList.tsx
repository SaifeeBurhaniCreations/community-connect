import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useMembers, Member } from '@/hooks/useDatabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, UserX } from 'lucide-react';
import { HOUSE_COLORS, HouseColor } from '@/types';

export function MembersList() {
  const navigate = useNavigate();
  const { getMembers } = useMembers();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHouse, setFilterHouse] = useState<HouseColor | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter(m => m.is_active)
      .filter(m => {
        const matchesSearch = 
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.surname.toLowerCase().includes(search.toLowerCase()) ||
          m.its_number.includes(search);
        const matchesHouse = filterHouse === 'all' || m.house_color === filterHouse;
        return matchesSearch && matchesHouse;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, search, filterHouse]);

  // Convert database member to component format
  const toMemberFormat = (m: Member) => ({
    ...m,
    houseColor: m.house_color as HouseColor,
    itsNumber: m.its_number,
    mobileNumber: m.mobile_number,
    profilePhoto: m.profile_photo,
    isActive: m.is_active,
    createdAt: m.created_at,
  });

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
          className="bg-primary text-primary-foreground rounded-full w-10 h-10"
        >
          <Plus className="w-5 h-5" />
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ITS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterHouse('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterHouse === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  All Houses
                </button>
                {HOUSE_COLORS.map(({ value, label, className }) => (
                  <button
                    key={value}
                    onClick={() => setFilterHouse(value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      filterHouse === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${className}`} />
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Members Count */}
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </p>

        {/* Members List */}
        <div className="space-y-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => navigate(`/members/${member.id}`)}
                className="card-elevated p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <Avatar member={toMemberFormat(member) as any} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {member.name} {member.surname}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ITS: {member.its_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Grade {member.grade} • Class {member.class}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No members found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || filterHouse !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first member to get started'}
              </p>
              {!search && filterHouse === 'all' && (
                <Button onClick={() => navigate('/members/new')}>
                  <Plus className="w-4 h-4 mr-2" /> Add Member
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
