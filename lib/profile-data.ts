import { BUS_ROUTES, BUS_STOPS, type BusRoute } from "./bus-data"

export interface UserProfile {
  name: string
  email: string
  phone: string
}

export interface SavedRoute {
  routeId: string
  savedAt: string
}

export interface RideHistoryEntry {
  id: string
  routeNumber: string
  routeName: string
  from: string
  to: string
  date: string
  duration: number // minutes
}

export interface NotificationPrefs {
  arrivalAlerts: boolean
  delayAlerts: boolean
  routeUpdates: boolean
}

const PROFILE_KEY = "bustracker_profile"
const SAVED_ROUTES_KEY = "bustracker_saved_routes"
const RIDE_HISTORY_KEY = "bustracker_ride_history"
const NOTIF_PREFS_KEY = "bustracker_notif_prefs"

// Profile
export function getProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "", email: "", phone: "" }
  const stored = localStorage.getItem(PROFILE_KEY)
  if (stored) return JSON.parse(stored)
  return { name: "Dhanush R", email: "dhanush@example.com", phone: "+91 98765 43210" }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// Saved routes
export function getSavedRoutes(): SavedRoute[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SAVED_ROUTES_KEY)
  if (stored) return JSON.parse(stored)
  return []
}

export function saveRoute(routeId: string) {
  const routes = getSavedRoutes()
  if (routes.find((r) => r.routeId === routeId)) return
  routes.push({ routeId, savedAt: new Date().toISOString() })
  localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(routes))
}

export function removeSavedRoute(routeId: string) {
  const routes = getSavedRoutes().filter((r) => r.routeId !== routeId)
  localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(routes))
}

export function isRouteSaved(routeId: string): boolean {
  return getSavedRoutes().some((r) => r.routeId === routeId)
}

// Ride history
export function getRideHistory(): RideHistoryEntry[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(RIDE_HISTORY_KEY)
  if (stored) return JSON.parse(stored)
  // Generate some mock history on first load
  const mockHistory = generateMockHistory()
  localStorage.setItem(RIDE_HISTORY_KEY, JSON.stringify(mockHistory))
  return mockHistory
}

function generateMockHistory(): RideHistoryEntry[] {
  const entries: RideHistoryEntry[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const route = BUS_ROUTES[Math.floor(Math.random() * BUS_ROUTES.length)]
    const dayOffset = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    entries.push({
      id: `ride-${i}`,
      routeNumber: route.number,
      routeName: route.name,
      from: route.from,
      to: route.to,
      date: date.toISOString(),
      duration: 15 + Math.floor(Math.random() * 30),
    })
  }
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Notification prefs
export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return { arrivalAlerts: true, delayAlerts: true, routeUpdates: false }
  const stored = localStorage.getItem(NOTIF_PREFS_KEY)
  if (stored) return JSON.parse(stored)
  return { arrivalAlerts: true, delayAlerts: true, routeUpdates: false }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs))
}

export function getRouteDetails(routeId: string): BusRoute | undefined {
  return BUS_ROUTES.find((r) => r.id === routeId)
}
