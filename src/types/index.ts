export type HouseColor = 'red' | 'blue' | 'green' | 'yellow';

export type KalamType = 'Salam' | 'Noha' | 'Madeh' | 'Naat' | 'Nasihat' | 'Noha 2' | 'Salam 2';

export interface Member {
  id: string;
  name: string;
  surname: string;
  houseColor: HouseColor;
  address: string;
  itsNumber: string;
  mobileNumber: string;
  grade: string;
  class: string;
  profilePhoto?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdAt: string;
}

export interface KalamAssignment {
  id: string;
  kalamType: KalamType;
  groupId: string;
  kalamName: string;
}

export interface Occasion {
  id: string;
  title: string;
  place: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  kalamAssignments: KalamAssignment[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  occasionId: string;
  isPresent: boolean;
  timestamp: string;
}

export const KALAM_TYPES: KalamType[] = [
  'Salam',
  'Noha',
  'Madeh',
  'Naat',
  'Nasihat',
  'Noha 2',
  'Salam 2'
];

export const HOUSE_COLORS: { value: HouseColor; label: string; className: string }[] = [
  { value: 'red', label: 'Red', className: 'bg-house-red' },
  { value: 'blue', label: 'Blue', className: 'bg-house-blue' },
  { value: 'green', label: 'Green', className: 'bg-house-green' },
  { value: 'yellow', label: 'Yellow', className: 'bg-house-yellow' },
];

export const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const CLASSES = ['A', 'B', 'C', 'D', 'E'];
