export type ProductCategory =
  | "Cement"
  | "Tiles"
  | "Paint"
  | "Plywood"
  | "Waterproofing"
  | "Steel"
  | "Plumbing"
  | "Electrical"
  | "Other";

export type StockStatus = "in_stock" | "low_stock" | "backorder" | "deleted";

export interface IProduct {
  id: string;
  title: string;
  category: ProductCategory | string;
  grade: string;
  price: number;
  unit: string;
  standard: string;
  shipper: string;
  status: StockStatus;
  leadTime?: string;
  image?: string;
  pageUrl?: string;
  description?: string;
  isDeleted?: boolean;
  lastUpdated?: number;
  deletedAt?: number;
}

export interface BOQRequestPayload {
  name: string;
  email: string;
  phone: string;
  pincode: string;
  materialSpec: string;
  quantity?: string;
  projectType?: string;
  notes?: string;
  timestamp?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  phone?: string;
  pincode?: string;
  photoURL?: string | null;
  createdAt?: unknown;
  lastLoginAt?: unknown;
}

export interface AdminSession {
  authenticated: boolean;
  email: string;
  role: string;
  token: string;
  loginTime: string;
}
