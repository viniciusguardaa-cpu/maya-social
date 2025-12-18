// Admin utilities for managing registered users

export interface RegisteredUser {
    id: string
    name: string
    email: string
    company: string
    plan: "starter" | "pro" | "enterprise"
    status: "active" | "trial" | "cancelled" | "past_due"
    mrr: number
    users: number
    brands: number
    country: string
    createdAt: string
    trialEndsAt?: string
}

// Get registered users from localStorage
export const getRegisteredUsers = (): RegisteredUser[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('maya-registered-users')
    return stored ? JSON.parse(stored) : []
}

// Save user to localStorage
export const saveRegisteredUser = (user: {
    id: string
    name: string
    email: string
    company?: string
    plan?: string
}) => {
    if (typeof window === 'undefined') return
    const users = getRegisteredUsers()
    const plan = (user.plan || 'starter') as "starter" | "pro" | "enterprise"
    
    const newCustomer: RegisteredUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company || 'Não informado',
        plan,
        status: 'trial',
        mrr: 0,
        users: 1,
        brands: 1,
        country: 'BR',
        createdAt: new Date().toISOString().split('T')[0],
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
    
    // Check if user already exists
    const existingIndex = users.findIndex((u: RegisteredUser) => u.email === user.email)
    if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...newCustomer, id: users[existingIndex].id }
    } else {
        users.push(newCustomer)
    }
    
    localStorage.setItem('maya-registered-users', JSON.stringify(users))
}

// Update user status
export const updateUserStatus = (userId: string, status: RegisteredUser['status'], mrr?: number) => {
    if (typeof window === 'undefined') return
    const users = getRegisteredUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index >= 0) {
        users[index].status = status
        if (mrr !== undefined) users[index].mrr = mrr
        localStorage.setItem('maya-registered-users', JSON.stringify(users))
    }
}
