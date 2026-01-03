import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from './api'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface AuthState {
  token: string | null
  user: User | null
  organizations: Organization[]
  currentOrg: Organization | null
  currentBrand: Brand | null
  isLoading: boolean
  
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setOrganizations: (orgs: Organization[]) => void
  setCurrentOrg: (org: Organization | null) => void
  setCurrentBrand: (brand: Brand | null) => void
  
  login: (email: string) => Promise<boolean>
  logout: () => void
  fetchMe: () => Promise<void>
  fetchBrands: () => Promise<Brand[]>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      organizations: [],
      currentOrg: null,
      currentBrand: null,
      isLoading: false,

      setToken: (token) => {
        set({ token })
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          localStorage.setItem('token', token)
        } else {
          delete api.defaults.headers.common['Authorization']
          localStorage.removeItem('token')
        }
      },

      setUser: (user) => set({ user }),
      setOrganizations: (organizations) => set({ organizations }),
      setCurrentOrg: (currentOrg) => set({ currentOrg }),
      setCurrentBrand: (currentBrand) => set({ currentBrand }),

      login: async (email: string) => {
        try {
          set({ isLoading: true })
          
          // Demo mode - bypass API
          if (email === 'demo@maya.com') {
            const demoUser = {
              id: 'demo-user-1',
              email: 'demo@maya.com',
              name: 'Usuário Demo',
              avatar: undefined
            }
            const demoOrg = {
              id: 'cmjt2jsa00000o2jmt8irkw7r',
              name: 'Maya Agency',
              slug: 'maya-agency',
              role: 'OWNER'
            }
            const demoBrand = {
              id: 'cmjt2jsdq0005o2jmp4b0adu5',
              name: 'Maya Brand',
              slug: 'maya-brand'
            }
            
            get().setToken('demo-token')
            set({ 
              user: demoUser, 
              organizations: [demoOrg],
              currentOrg: demoOrg,
              currentBrand: demoBrand,
              isLoading: false 
            })
            return true
          }
          
          // Real API login
          const response = await api.post('/auth/login', { email })
          const { access_token, user } = response.data
          
          get().setToken(access_token)
          set({ user, isLoading: false })
          
          await get().fetchMe()
          return true
        } catch (error) {
          console.error('Login failed:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          organizations: [],
          currentOrg: null,
          currentBrand: null,
        })
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      },

      fetchMe: async () => {
        try {
          const response = await api.get('/auth/me')
          const { organizations, ...user } = response.data
          
          set({ user, organizations })
          
          if (organizations.length > 0 && !get().currentOrg) {
            set({ currentOrg: organizations[0] })
            const brands = await get().fetchBrands()
            if (brands.length > 0) {
              set({ currentBrand: brands[0] })
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          get().logout()
        }
      },

      fetchBrands: async () => {
        const { currentOrg } = get()
        if (!currentOrg) return []
        
        try {
          const response = await api.get(`/organizations/${currentOrg.id}/brands`)
          return response.data
        } catch (error) {
          console.error('Failed to fetch brands:', error)
          return []
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        currentOrg: state.currentOrg,
        currentBrand: state.currentBrand,
      }),
    }
  )
)

// Initialize auth on load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    useAuthStore.getState().setToken(token)
    useAuthStore.getState().fetchMe()
  }
}
