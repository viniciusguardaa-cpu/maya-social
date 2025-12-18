import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export interface Organization {
  id: string
  name: string
  slug: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  organizationId: string
}

export interface ContentItem {
  id: string
  code: string
  type: string
  status: string
  scheduledAt?: string
  publishedAt?: string
  brief?: {
    title: string
    caption?: string
  }
}

export interface DashboardData {
  totalPosts: number
  totalReach: number
  totalEngagement: number
  avgEngagementRate: number
  topContent: ContentItem[]
  trend: Array<{ date: string; reach: number; engagement: number }>
}

export const organizationsApi = {
  list: () => api.get<Organization[]>("/organizations"),
  get: (id: string) => api.get<Organization>(`/organizations/${id}`),
}

export const brandsApi = {
  list: (orgId: string) => api.get<Brand[]>(`/organizations/${orgId}/brands`),
  get: (orgId: string, brandId: string) => 
    api.get<Brand>(`/organizations/${orgId}/brands/${brandId}`),
}

export const contentApi = {
  list: (orgId: string, brandId: string) =>
    api.get<ContentItem[]>(`/organizations/${orgId}/brands/${brandId}/content`),
  kanban: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/content/kanban`),
  upcoming: (orgId: string, brandId: string, days = 7) =>
    api.get<ContentItem[]>(`/organizations/${orgId}/brands/${brandId}/content/upcoming?days=${days}`),
  get: (orgId: string, brandId: string, contentId: string) =>
    api.get<ContentItem>(`/organizations/${orgId}/brands/${brandId}/content/${contentId}`),
  generateBrief: (orgId: string, brandId: string, contentId: string) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/content/${contentId}/generate-brief`),
  moveTo: (orgId: string, brandId: string, contentId: string, status: string) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/content/${contentId}/move-to`, { status }),
}

export const calendarApi = {
  listMonths: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/calendar/months`),
  getMonth: (orgId: string, brandId: string, monthId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/calendar/${monthId}`),
  preview: (orgId: string, brandId: string, year: number, month: number) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/calendar/preview?year=${year}&month=${month}`),
  generate: (orgId: string, brandId: string, year: number, month: number) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/calendar/generate`, { brandId, year, month }),
}

export const analyticsApi = {
  dashboard: (orgId: string, brandId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    return api.get<DashboardData>(`/organizations/${orgId}/brands/${brandId}/analytics/dashboard?${params}`)
  },
  growth: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/analytics/growth`),
  bestTimes: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/analytics/best-times`),
  contentTypes: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/analytics/content-types`),
}

export const publicationsApi = {
  list: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/publications`),
  scheduled: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/publications/scheduled`),
  publish: (orgId: string, brandId: string, contentId: string, data: any) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/publications/content/${contentId}/publish`, data),
  schedule: (orgId: string, brandId: string, contentId: string, data: any) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/publications/content/${contentId}/schedule`, data),
}

export const templatesApi = {
  list: (orgId: string, brandId: string) =>
    api.get(`/organizations/${orgId}/brands/${brandId}/templates`),
  create: (orgId: string, brandId: string, data: any) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/templates`, data),
  createDefaults: (orgId: string, brandId: string) =>
    api.post(`/organizations/${orgId}/brands/${brandId}/templates/defaults`),
}
