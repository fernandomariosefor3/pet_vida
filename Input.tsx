export type Species = 'dog' | 'cat' | 'other';

export interface HealthRecord {
  id: string;
  description: string;
  date: string;
  type: string;
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  weight: string;
  healthRecords: HealthRecord[];
  avatar: string;
}

export interface PetEvent {
  id: string;
  petId: string;
  description: string;
  date: string;
  time: string;
  type: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}
