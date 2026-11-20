export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  color: string;
  startAt: string;
  endAt: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
};

export type EventInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  color?: string;
  startAt: string;
  endAt: string;
  isPublic?: boolean;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};