import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Avatar } from '@/components/Avatar';
import { useGroups, useGroupMembers, Group } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, FolderOpen, Search, ChevronRight } from 'lucide-react';

export function GroupsList() {
  const navigate = useNavigate();
  const { getGroups } = useGroups();
  const { getGroupMembers } = useGroupMembers();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembersMap, setGroupMembersMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsData = await getGroups();
      setGroups(groupsData || []);

      // Load members for each group
      const membersMap: Record<string, any[]> = {};
      for (const group of (groupsData || [])) {
        const members = await getGroupMembers(group.id);
        membersMap[group.id] = members || [];
      }
      setGroupMembersMap(membersMap);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = Object.values(groupMembersMap).reduce((sum, members) => sum + members.length, 0);

  if (loading) {
    return (
      <Layout
        title="Groups"
        rightAction={
          <Button
            onClick={() => navigate('/groups/new')}
            size="icon"
            className="bg-primary text-primary-foreground rounded-full w-10 h-10 shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5" />
          </Button>
        }
      >
        <div className="flex flex-col min-h-[calc(100vh-8rem)]">
          {/* Stats Header Skeleton */}
          <div className="px-4 pt-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>

          {/* Search Skeleton */}
          <div className="px-4 py-3">
            <Skeleton className="h-12 rounded-xl" />
          </div>

          {/* Groups List Skeleton */}
          <div className="flex-1 px-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Groups"
      rightAction={
        <Button
          onClick={() => navigate('/groups/new')}
          size="icon"
          className="bg-primary text-primary-foreground rounded-full w-10 h-10 shadow-lg shadow-primary/25"
        >
          <Plus className="w-5 h-5" />
        </Button>
      }
    >
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Stats Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-4 pb-2"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                  <p className="text-xs text-muted-foreground">Total Groups</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 py-3"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </motion.div>

        {/* Groups List */}
        <div className="flex-1 px-4 pb-20 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => {
                const groupMembers = groupMembersMap[group.id] || [];
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="bg-card rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all duration-200 border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg truncate">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary/80 rounded-full">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    {/* Member Avatars */}
                    {groupMembers.length > 0 && (
                      <div className="flex items-center mt-4 pt-4 border-t border-border/50">
                        <div className="flex -space-x-2">
                          {groupMembers.slice(0, 5).map((gm) => {
                            const member = gm.members;
                            if (!member) return null;
                            return (
                              <Avatar 
                                key={gm.id} 
                                member={member} 
                                size="sm" 
                                showHouse={false} 
                              />
                            );
                          })}
                        </div>
                        {groupMembers.length > 5 && (
                          <span className="ml-2 text-xs font-medium text-muted-foreground">
                            +{groupMembers.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {search ? 'No groups found' : 'No groups yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  {search 
                    ? 'Try a different search term'
                    : 'Create groups to organize your members and assign them for occasions'
                  }
                </p>
                {!search && (
                  <Button 
                    onClick={() => navigate('/groups/new')}
                    className="rounded-xl h-12 px-6 shadow-lg shadow-primary/25"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Create First Group
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
