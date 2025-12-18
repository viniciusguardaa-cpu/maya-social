// ============================================
// ENUMS
// ============================================

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PRODUCER = 'PRODUCER',
  SUPPORT = 'SUPPORT',
}

export enum ContentType {
  FEED = 'FEED',
  REELS = 'REELS',
  STORIES = 'STORIES',
  AD = 'AD',
  CAROUSEL = 'CAROUSEL',
}

export enum ContentStatus {
  PLANNED = 'PLANNED',
  BRIEFED = 'BRIEFED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  MEASURED = 'MEASURED',
  CANCELLED = 'CANCELLED',
}

export enum Recurrence {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface ContentTemplate {
  id: string;
  brandId: string;
  name: string;
  type: ContentType;
  dayOfWeek: number;
  time: string;
  recurrence: Recurrence;
  category?: string;
  isActive: boolean;
  priority: number;
}

export interface ContentItem {
  id: string;
  brandId: string;
  code: string;
  type: ContentType;
  status: ContentStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
}

export interface CalendarMonth {
  id: string;
  brandId: string;
  year: number;
  month: number;
  status: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
