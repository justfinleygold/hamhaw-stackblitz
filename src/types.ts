export interface Person {
  id: string;
  name: string;
  age: number;
  lastSeen: {
    date: string;
    location: string;
    details: string;
  };
  description: string;
  image: string;
  status: 'missing' | 'found' | 'investigating';
  updates: Update[];
}

export interface Update {
  id: string;
  timestamp: string;
  location: string;
  details: string;
  reportedBy: string;
  verified: boolean;
}