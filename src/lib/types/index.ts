export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  verified?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

export type ItemStatus = "OPEN" | "CLAIMED" | "RESOLVED";
export type ItemType = "LOST" | "FOUND";
export type ItemCategory =
  | "ELECTRONICS"
  | "CLOTHING"
  | "ID_CARDS"
  | "KEYS"
  | "OTHER";

export interface Item {
  id: string;
  title: string;
  description?: string | null;
  type: ItemType;
  category: ItemCategory;
  status: ItemStatus;
  location?: string | null;
  user_id: string;
  image_url: string | null;
  date_incident?: string | null; // when lost/found
  created_at: string;
  updated_at: string;
}

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  status: ClaimStatus;
  proof_description: string | null;
  created_at: string;
  updated_at: string;
}

