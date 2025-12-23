import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Types
export type Member = Tables<'members'>;
export type Group = Tables<'groups'>;
export type Occasion = Tables<'occasions'>;
export type KalamAssignment = Tables<'kalam_assignments'>;
export type Attendance = Tables<'attendance'>;
export type GroupMember = Tables<'group_members'>;

// Helper to get user_id
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// Members
export const useMembers = () => {
  const { user } = useAuth();

  const getMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }, []);

  const getMember = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }, []);

  const createMember = useCallback(async (member: Omit<TablesInsert<'members'>, 'user_id'>) => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('members')
      .insert({ ...member, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const updateMember = useCallback(async (id: string, member: TablesUpdate<'members'>) => {
    const { data, error } = await supabase
      .from('members')
      .update(member)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }, []);

  return { getMembers, getMember, createMember, updateMember, deleteMember };
};

// Groups
export const useGroups = () => {
  const getGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }, []);

  const getGroup = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }, []);

  const createGroup = useCallback(async (group: Omit<TablesInsert<'groups'>, 'user_id'>) => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('groups')
      .insert({ ...group, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const updateGroup = useCallback(async (id: string, group: TablesUpdate<'groups'>) => {
    const { data, error } = await supabase
      .from('groups')
      .update(group)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }, []);

  return { getGroups, getGroup, createGroup, updateGroup, deleteGroup };
};

// Group Members
export const useGroupMembers = () => {
  const getGroupMembers = useCallback(async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, members(*)')
      .eq('group_id', groupId);
    
    if (error) throw error;
    return data;
  }, []);

  const getAllGroupMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('group_members')
      .select('member_id, group_id');
    
    if (error) throw error;
    return data;
  }, []);

  const getMemberGroups = useCallback(async (memberId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('member_id', memberId);
    
    if (error) throw error;
    return data;
  }, []);

  const addMemberToGroup = useCallback(async (groupId: string, memberId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, member_id: memberId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const removeMemberFromGroup = useCallback(async (groupId: string, memberId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId);
    
    if (error) throw error;
  }, []);

  const setGroupMembers = useCallback(async (groupId: string, memberIds: string[]) => {
    // Delete existing members
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);

    // Insert new members
    if (memberIds.length > 0) {
      const { error } = await supabase
        .from('group_members')
        .insert(memberIds.map(memberId => ({ group_id: groupId, member_id: memberId })));
      
      if (error) throw error;
    }
  }, []);

  return { getGroupMembers, getAllGroupMembers, getMemberGroups, addMemberToGroup, removeMemberFromGroup, setGroupMembers };
};

// Occasions
export const useOccasions = () => {
  const getOccasions = useCallback(async () => {
    const { data, error } = await supabase
      .from('occasions')
      .select('*, kalam_assignments(*)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }, []);

  const getOccasion = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('occasions')
      .select('*, kalam_assignments(*)')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }, []);

  const createOccasion = useCallback(async (
    occasion: Omit<TablesInsert<'occasions'>, 'user_id'>,
    kalamAssignments?: Omit<TablesInsert<'kalam_assignments'>, 'occasion_id'>[]
  ) => {
    const userId = await getUserId();
    
    const { data: occasionData, error: occasionError } = await supabase
      .from('occasions')
      .insert({ ...occasion, user_id: userId })
      .select()
      .single();
    
    if (occasionError) throw occasionError;

    if (kalamAssignments && kalamAssignments.length > 0) {
      const { error: kalamError } = await supabase
        .from('kalam_assignments')
        .insert(kalamAssignments.map(k => ({ ...k, occasion_id: occasionData.id })));
      
      if (kalamError) throw kalamError;
    }

    return occasionData;
  }, []);

  const updateOccasion = useCallback(async (
    id: string,
    occasion: TablesUpdate<'occasions'>,
    kalamAssignments?: Omit<TablesInsert<'kalam_assignments'>, 'occasion_id'>[]
  ) => {
    const { data, error } = await supabase
      .from('occasions')
      .update(occasion)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    if (kalamAssignments) {
      // Delete existing assignments
      await supabase.from('kalam_assignments').delete().eq('occasion_id', id);
      
      // Insert new assignments
      if (kalamAssignments.length > 0) {
        const { error: kalamError } = await supabase
          .from('kalam_assignments')
          .insert(kalamAssignments.map(k => ({ ...k, occasion_id: id })));
        
        if (kalamError) throw kalamError;
      }
    }

    return data;
  }, []);

  const deleteOccasion = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('occasions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }, []);

  return { getOccasions, getOccasion, createOccasion, updateOccasion, deleteOccasion };
};

// Attendance
export const useAttendance = () => {
  const getAttendanceForOccasion = useCallback(async (occasionId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, members(*)')
      .eq('occasion_id', occasionId);
    
    if (error) throw error;
    return data;
  }, []);

  const getAttendanceForMember = useCallback(async (memberId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, occasions(*)')
      .eq('member_id', memberId)
      .order('marked_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }, []);

  const markAttendance = useCallback(async (memberId: string, occasionId: string, isPresent: boolean) => {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        { member_id: memberId, occasion_id: occasionId, is_present: isPresent },
        { onConflict: 'member_id,occasion_id' }
      )
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  const getMemberAttendanceStats = useCallback(async (memberId: string) => {
    // Get all occasions and member's attendance records
    const [{ data: attendance, error: attendanceError }, { count: totalOccasions, error: countError }] = await Promise.all([
      supabase
        .from('attendance')
        .select('is_present')
        .eq('member_id', memberId),
      supabase
        .from('occasions')
        .select('*', { count: 'exact', head: true })
    ]);
    
    if (attendanceError) throw attendanceError;
    if (countError) throw countError;

    // Count only explicitly marked as present
    const attended = attendance?.filter(a => a.is_present).length || 0;
    // Total is ALL occasions - if not marked present, they're absent
    const total = totalOccasions || 0;
    
    return {
      total,
      attended,
      // Percentage based on total occasions, not just marked records
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
    };
  }, []);

  return { getAttendanceForOccasion, getAttendanceForMember, markAttendance, getMemberAttendanceStats };
};

// Analytics
export const useAnalytics = () => {
  const getDashboardStats = useCallback(async () => {
    const [
      { count: totalMembers },
      { count: totalGroups },
      { count: totalOccasions },
    ] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('occasions').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalMembers: totalMembers || 0,
      totalGroups: totalGroups || 0,
      totalOccasions: totalOccasions || 0,
    };
  }, []);

  const getAttendanceTrends = useCallback(async (limit: number = 10) => {
    const { data: occasions, error } = await supabase
      .from('occasions')
      .select('id, title, date')
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;

    const trends = await Promise.all(
      (occasions || []).map(async (occasion) => {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('is_present')
          .eq('occasion_id', occasion.id);
        
        const total = attendance?.length || 0;
        const present = attendance?.filter(a => a.is_present).length || 0;
        
        return {
          occasionId: occasion.id,
          title: occasion.title,
          date: occasion.date,
          total,
          present,
          absent: total - present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
    );

    return trends.reverse(); // Oldest first for chart
  }, []);

  const getGroupPerformance = useCallback(async () => {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, name');
    
    if (error) throw error;

    const performance = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: members } = await supabase
          .from('group_members')
          .select('member_id')
          .eq('group_id', group.id);
        
        const memberIds = members?.map(m => m.member_id) || [];
        
        if (memberIds.length === 0) {
          return { groupId: group.id, name: group.name, attendance: 0, memberCount: 0 };
        }

        const { data: attendance } = await supabase
          .from('attendance')
          .select('is_present')
          .in('member_id', memberIds);
        
        const total = attendance?.length || 0;
        const present = attendance?.filter(a => a.is_present).length || 0;
        
        return {
          groupId: group.id,
          name: group.name,
          attendance: total > 0 ? Math.round((present / total) * 100) : 0,
          memberCount: memberIds.length,
        };
      })
    );

    return performance.sort((a, b) => b.attendance - a.attendance);
  }, []);

  const getMostActiveMembers = useCallback(async (limit: number = 5) => {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, surname')
      .eq('is_active', true);
    
    if (error) throw error;

    const memberStats = await Promise.all(
      (members || []).map(async (member) => {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('is_present')
          .eq('member_id', member.id);
        
        const total = attendance?.length || 0;
        const present = attendance?.filter(a => a.is_present).length || 0;
        
        return {
          ...member,
          attended: present,
          total,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
    );

    return memberStats
      .sort((a, b) => b.percentage - a.percentage || b.attended - a.attended)
      .slice(0, limit);
  }, []);

  const getLeastActiveMembers = useCallback(async (limit: number = 5) => {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, surname')
      .eq('is_active', true);
    
    if (error) throw error;

    const memberStats = await Promise.all(
      (members || []).map(async (member) => {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('is_present')
          .eq('member_id', member.id);
        
        const total = attendance?.length || 0;
        const present = attendance?.filter(a => a.is_present).length || 0;
        
        return {
          ...member,
          attended: present,
          total,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
    );

    return memberStats
      .sort((a, b) => a.percentage - b.percentage || a.attended - b.attended)
      .slice(0, limit);
  }, []);

  return { 
    getDashboardStats, 
    getAttendanceTrends, 
    getGroupPerformance, 
    getMostActiveMembers,
    getLeastActiveMembers 
  };
};
