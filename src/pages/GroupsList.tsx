import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Plus, Users, FolderOpen } from 'lucide-react';

export function GroupsList() {
  const navigate = useNavigate();
  const { groups, members } = useStore();

  return (
    <Layout
      title="Groups"
      rightAction={
        <Button
          onClick={() => navigate('/groups/new')}
          size="icon"
          className="bg-primary text-primary-foreground rounded-full w-10 h-10"
        >
          <Plus className="w-5 h-5" />
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          {groups.length} group{groups.length !== 1 ? 's' : ''}
        </p>

        {groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group, index) => {
              const groupMembers = members.filter(m => group.memberIds.includes(m.id));
              
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Member Avatars */}
                  {groupMembers.length > 0 && (
                    <div className="flex -space-x-2 mt-3 pl-16">
                      {groupMembers.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-medium"
                        >
                          {member.name[0]}{member.surname[0]}
                        </div>
                      ))}
                      {groupMembers.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-xs font-medium">
                          +{groupMembers.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create groups to organize your members
            </p>
            <Button onClick={() => navigate('/groups/new')}>
              <Plus className="w-4 h-4 mr-2" /> Create Group
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
