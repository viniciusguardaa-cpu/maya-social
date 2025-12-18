// ============================================
// CONTENT TYPE LABELS
// ============================================

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  FEED: 'Feed',
  REELS: 'Reels',
  STORIES: 'Stories',
  AD: 'Anúncio',
  CAROUSEL: 'Carrossel',
};

export const CONTENT_TYPE_CODES: Record<string, string> = {
  FEED: 'FD',
  REELS: 'RL',
  STORIES: 'ST',
  AD: 'AD',
  CAROUSEL: 'CA',
};

// ============================================
// STATUS LABELS
// ============================================

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planejado',
  BRIEFED: 'Briefado',
  IN_PRODUCTION: 'Em Produção',
  READY: 'Pronto',
  AWAITING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  MEASURED: 'Medido',
  CANCELLED: 'Cancelado',
};

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  REVISION_REQUESTED: 'Revisão Solicitada',
};

// ============================================
// ROLE LABELS & PERMISSIONS
// ============================================

export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gestor',
  PRODUCER: 'Produtor',
  SUPPORT: 'Suporte',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['*'],
  ADMIN: ['manage:org', 'manage:brands', 'manage:users', 'manage:content', 'approve'],
  MANAGER: ['manage:content', 'approve', 'view:all'],
  PRODUCER: ['create:content', 'upload:assets', 'view:assigned'],
  SUPPORT: ['view:inbox', 'respond:dm'],
};

// ============================================
// DAY OF WEEK
// ============================================

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

// ============================================
// VALIDATION
// ============================================

export const VALIDATION = {
  MAX_FILE_SIZE_MB: 100,
  MAX_VIDEO_DURATION_SECONDS: 90,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
  MIN_IMAGE_WIDTH: 1080,
  MIN_IMAGE_HEIGHT: 1080,
};

// ============================================
// API ROUTES
// ============================================

export const API_ROUTES = {
  AUTH: {
    GOOGLE: '/api/auth/google',
    GOOGLE_CALLBACK: '/api/auth/google/callback',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
  ORGANIZATIONS: '/api/organizations',
  BRANDS: (orgId: string) => `/api/organizations/${orgId}/brands`,
  TEMPLATES: (orgId: string, brandId: string) => 
    `/api/organizations/${orgId}/brands/${brandId}/templates`,
  CALENDAR: (orgId: string, brandId: string) => 
    `/api/organizations/${orgId}/brands/${brandId}/calendar`,
  CONTENT: (orgId: string, brandId: string) => 
    `/api/organizations/${orgId}/brands/${brandId}/content`,
  APPROVALS: (orgId: string, brandId: string) => 
    `/api/organizations/${orgId}/brands/${brandId}/approvals`,
};
