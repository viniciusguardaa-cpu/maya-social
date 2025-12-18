"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem("theme") as Theme | null
        if (stored) {
            setTheme(stored)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement

        if (theme === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            root.classList.toggle("dark", prefersDark)
        } else {
            root.classList.toggle("dark", theme === "dark")
        }

        localStorage.setItem("theme", theme)
    }, [theme, mounted])

    useEffect(() => {
        if (theme !== "system") return

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle("dark", e.matches)
        }

        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [theme])

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        return { theme: "system" as Theme, setTheme: () => { } }
    }
    return context
}
