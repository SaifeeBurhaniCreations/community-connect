import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Member, Group, Occasion, AttendanceRecord, KalamAssignment } from '@/types';

interface AppState {
  // Members
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;

  // Groups
  groups: Group[];
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  getGroup: (id: string) => Group | undefined;

  // Occasions
  occasions: Occasion[];
  addOccasion: (occasion: Omit<Occasion, 'id' | 'createdAt'>) => void;
  updateOccasion: (id: string, occasion: Partial<Occasion>) => void;
  deleteOccasion: (id: string) => void;
  getOccasion: (id: string) => Occasion | undefined;

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (memberId: string, occasionId: string, isPresent: boolean) => void;
  getAttendanceForOccasion: (occasionId: string) => AttendanceRecord[];
  getAttendanceForMember: (memberId: string) => AttendanceRecord[];
  getMemberAttendanceStats: (memberId: string) => { total: number; attended: number; percentage: number };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Members
      members: [],
      addMember: (member) => set((state) => ({
        members: [...state.members, { ...member, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateMember: (id, member) => set((state) => ({
        members: state.members.map((m) => m.id === id ? { ...m, ...member } : m)
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        attendance: state.attendance.filter((a) => a.memberId !== id)
      })),
      getMember: (id) => get().members.find((m) => m.id === id),

      // Groups
      groups: [],
      addGroup: (group) => set((state) => ({
        groups: [...state.groups, { ...group, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateGroup: (id, group) => set((state) => ({
        groups: state.groups.map((g) => g.id === id ? { ...g, ...group } : g)
      })),
      deleteGroup: (id) => set((state) => ({
        groups: state.groups.filter((g) => g.id !== id)
      })),
      getGroup: (id) => get().groups.find((g) => g.id === id),

      // Occasions
      occasions: [],
      addOccasion: (occasion) => set((state) => ({
        occasions: [...state.occasions, { ...occasion, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateOccasion: (id, occasion) => set((state) => ({
        occasions: state.occasions.map((o) => o.id === id ? { ...o, ...occasion } : o)
      })),
      deleteOccasion: (id) => set((state) => ({
        occasions: state.occasions.filter((o) => o.id !== id),
        attendance: state.attendance.filter((a) => a.occasionId !== id)
      })),
      getOccasion: (id) => get().occasions.find((o) => o.id === id),

      // Attendance
      attendance: [],
      markAttendance: (memberId, occasionId, isPresent) => set((state) => {
        const existingIndex = state.attendance.findIndex(
          (a) => a.memberId === memberId && a.occasionId === occasionId
        );
        
        if (existingIndex >= 0) {
          const newAttendance = [...state.attendance];
          newAttendance[existingIndex] = {
            ...newAttendance[existingIndex],
            isPresent,
            timestamp: new Date().toISOString()
          };
          return { attendance: newAttendance };
        }
        
        return {
          attendance: [...state.attendance, {
            id: uuidv4(),
            memberId,
            occasionId,
            isPresent,
            timestamp: new Date().toISOString()
          }]
        };
      }),
      getAttendanceForOccasion: (occasionId) => 
        get().attendance.filter((a) => a.occasionId === occasionId),
      getAttendanceForMember: (memberId) =>
        get().attendance.filter((a) => a.memberId === memberId),
      getMemberAttendanceStats: (memberId) => {
        const memberAttendance = get().attendance.filter((a) => a.memberId === memberId);
        const attended = memberAttendance.filter((a) => a.isPresent).length;
        const total = get().occasions.length;
        return {
          total,
          attended,
          percentage: total > 0 ? Math.round((attended / total) * 100) : 0
        };
      }
    }),
    {
      name: 'majlis-manager-storage'
    }
  )
);
