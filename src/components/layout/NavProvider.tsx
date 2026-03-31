'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface NavContextType {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const NavContext = createContext<NavContextType>({
  activeProjectId: null,
  setActiveProjectId: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
})

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <NavContext.Provider value={{ activeProjectId, setActiveProjectId, sidebarOpen, setSidebarOpen }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
