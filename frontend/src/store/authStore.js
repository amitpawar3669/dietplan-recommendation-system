import { create } from 'zustand'

export const useAuthStore = create((set) => {
  // Load auth state from localStorage on initialization
  const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const initialUser = savedAuth ? JSON.parse(savedAuth) : null

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,

    // Login user
    login: (email, password) => {
      // Simple client-side auth (for demo purposes)
      // In production, validate against backend
      const user = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        loginTime: new Date().toISOString(),
      }
      localStorage.setItem('authUser', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return user
    },

    // Sign up user
    signup: (email, password, name) => {
      const user = {
        id: Date.now(),
        email,
        name,
        signupTime: new Date().toISOString(),
      }
      localStorage.setItem('authUser', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return user
    },

    // Logout user
    logout: () => {
      localStorage.removeItem('authUser')
      set({ user: null, isAuthenticated: false })
    },

    // Update user profile
    updateUser: (userData) => {
      const updatedUser = { ...userData }
      localStorage.setItem('authUser', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    },
  }
})
