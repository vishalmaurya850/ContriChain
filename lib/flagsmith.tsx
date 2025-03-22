"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import flagsmith from "flagsmith"

interface FlagsmithContextType {
  isFeatureEnabled: (flagName: string) => boolean
  getValue: (flagName: string) => any
  loading: boolean
}

const FlagsmithContext = createContext<FlagsmithContextType | undefined>(undefined)

export function FlagsmithProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initFlagsmith = async () => {
      try {
        await flagsmith.init({
          environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENV_ID || "YOUR_FLAGSMITH_ENV_ID",
          cacheFlags: true,
        })
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing Flagsmith:", error)
      } finally {
        setLoading(false)
      }
    }

    initFlagsmith()
  }, [])

  const isFeatureEnabled = (flagName: string) => {
    if (!initialized) return false
    return flagsmith.hasFeature(flagName)
  }

  const getValue = (flagName: string) => {
    if (!initialized) return null
    return flagsmith.getValue(flagName)
  }

  return (
    <FlagsmithContext.Provider value={{ isFeatureEnabled, getValue, loading }}>{children}</FlagsmithContext.Provider>
  )
}

export function useFlagsmith() {
  const context = useContext(FlagsmithContext)
  if (context === undefined) {
    throw new Error("useFlagsmith must be used within a FlagsmithProvider")
  }
  return context
}

