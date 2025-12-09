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

export type ItemStatus = "lost" | "found" | "claimed" | "returned";
export type ItemCategory =
  | "electronics"
  | "id"
  | "keys"
  | "apparel"
  | "documents"
  | "other";

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  status: ItemStatus;
  location: string;
  campus?: string;
  tags?: string[];
  reportedBy: string; // user id
  images?: string[];
  occurredAt: string; // when lost/found
  createdAt: string;
  updatedAt: string;
  claimId?: string;
}

export type ClaimStatus = "pending" | "approved" | "rejected" | "returned";

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  status: ClaimStatus;
  proofMessage?: string;
  proofImages?: string[];
  contactMethod?: "email" | "phone";
  reviewedBy?: string; // admin id
  createdAt: string;
  updatedAt: string;
}

