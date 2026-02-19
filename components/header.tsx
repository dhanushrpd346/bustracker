"use client"

import { Bus, Search, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function Header({ title, subtitle, showSearch, searchValue, onSearchChange, searchPlaceholder }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="flex-shrink-0 bg-primary px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="mx-auto max-w-lg">
        {searchOpen && showSearch ? (
          <div className="flex items-center gap-2 animate-slide-up">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-primary-foreground/15 px-3 py-2.5">
              <Search className="h-4 w-4 text-primary-foreground/70" />
              <input
                type="text"
                value={searchValue || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder || "Search..."}
                className="flex-1 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={() => { setSearchOpen(false); onSearchChange?.("") }}
              className="rounded-xl p-2 text-primary-foreground/70 hover:text-primary-foreground"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Bus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-primary-foreground/70">{subtitle}</p>
                )}
              </div>
            </div>
            {showSearch && (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-xl p-2.5 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
