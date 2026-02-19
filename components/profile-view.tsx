"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  getProfile,
  saveProfile,
  getSavedRoutes,
  removeSavedRoute,
  getRideHistory,
  getNotificationPrefs,
  saveNotificationPrefs,
  getRouteDetails,
  type UserProfile,
  type SavedRoute,
  type RideHistoryEntry,
  type NotificationPrefs,
} from "@/lib/profile-data"
import {
  ArrowLeft,
  User,
  Pencil,
  Check,
  Bookmark,
  History,
  Bell,
  Trash2,
  Clock,
  MapPin,
  Route,
  ChevronRight,
} from "lucide-react"

interface ProfileViewProps {
  onClose: () => void
}

export function ProfileView({ onClose }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", phone: "" })
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile>({ name: "", email: "", phone: "" })
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [rideHistory, setRideHistory] = useState<RideHistoryEntry[]>([])
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    arrivalAlerts: true,
    delayAlerts: true,
    routeUpdates: false,
  })
  const [activeSection, setActiveSection] = useState<"routes" | "history" | "notifications">("routes")

  useEffect(() => {
    setProfile(getProfile())
    setSavedRoutes(getSavedRoutes())
    setRideHistory(getRideHistory())
    setNotifPrefs(getNotificationPrefs())
  }, [])

  const handleSaveProfile = () => {
    saveProfile(editForm)
    setProfile(editForm)
    setEditing(false)
  }

  const handleStartEdit = () => {
    setEditForm({ ...profile })
    setEditing(true)
  }

  const handleRemoveRoute = (routeId: string) => {
    removeSavedRoute(routeId)
    setSavedRoutes(getSavedRoutes())
  }

  const handleToggleNotif = (key: keyof NotificationPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    saveNotificationPrefs(updated)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up">
      {/* Header */}
      <header className="flex-shrink-0 bg-primary px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">Profile</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 py-5">
          {/* Profile card */}
          <div className="mb-6 rounded-2xl bg-card p-5 shadow-sm border border-border">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-foreground">{profile.name || "Set your name"}</h2>
                      <button
                        onClick={handleStartEdit}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        aria-label="Edit profile"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.email || "Set your email"}</p>
                    <p className="text-sm text-muted-foreground">{profile.phone || "Set your phone"}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section tabs */}
          <div className="mb-5 flex gap-2">
            {([
              { id: "routes" as const, label: "Saved Routes", icon: Bookmark },
              { id: "history" as const, label: "History", icon: History },
              { id: "notifications" as const, label: "Alerts", icon: Bell },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                  activeSection === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Saved Routes */}
          {activeSection === "routes" && (
            <div className="flex flex-col gap-3">
              {savedRoutes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 text-center border border-border">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                    <Bookmark className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No saved routes</p>
                    <p className="text-sm text-muted-foreground">Tap the bookmark icon on any bus detail to save a route here.</p>
                  </div>
                </div>
              ) : (
                savedRoutes.map((sr) => {
                  const route = getRouteDetails(sr.routeId)
                  if (!route) return null
                  return (
                    <div key={sr.routeId} className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border">
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground"
                        style={{ backgroundColor: route.color }}
                      >
                        {route.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{route.name}</p>
                        <p className="text-xs text-muted-foreground">{route.from} → {route.to}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveRoute(sr.routeId)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label={`Remove route ${route.number}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Ride History */}
          {activeSection === "history" && (
            <div className="flex flex-col gap-2">
              {rideHistory.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 text-center border border-border">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                    <History className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No ride history</p>
                    <p className="text-sm text-muted-foreground">Your travel history will appear here.</p>
                  </div>
                </div>
              ) : (
                rideHistory.map((ride) => (
                  <div key={ride.id} className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Route className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Route {ride.routeNumber}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(ride.date)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{ride.from} → {ride.to}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {ride.duration}m
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Notification Preferences */}
          {activeSection === "notifications" && (
            <div className="flex flex-col gap-3">
              {([
                { key: "arrivalAlerts" as const, label: "Arrival Alerts", desc: "Get notified when your bus is approaching" },
                { key: "delayAlerts" as const, label: "Delay Alerts", desc: "Get notified about bus delays on saved routes" },
                { key: "routeUpdates" as const, label: "Route Updates", desc: "Receive updates about route changes and schedules" },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-card p-4 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotif(key)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors",
                      notifPrefs[key] ? "bg-primary" : "bg-secondary"
                    )}
                    role="switch"
                    aria-checked={notifPrefs[key]}
                    aria-label={label}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-primary-foreground shadow-sm transition-transform",
                        notifPrefs[key] && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
