"use client"

import { useState } from "react"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import {
  Bell, BellOff, AlertTriangle, Info, CheckCircle2, Clock,
  Bus, MapPin, Trash2, ToggleLeft, ToggleRight
} from "lucide-react"

interface Alert {
  id: string
  type: "delay" | "diversion" | "info" | "resolved"
  title: string
  message: string
  route?: string
  time: string
  read: boolean
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: "a1", type: "delay", title: "Route 1 Delayed",
    message: "Bus on Route 1 (Junction - Palayamkottai) is running 12 minutes behind schedule due to traffic congestion near Vannarpettai.",
    route: "1", time: "5 min ago", read: false,
  },
  {
    id: "a2", type: "diversion", title: "Route 7 Diverted",
    message: "Route 7 buses are being diverted via High Ground due to road maintenance work near Krishnapuram. Expected to resume normal route by 6 PM.",
    route: "7", time: "20 min ago", read: false,
  },
  {
    id: "a3", type: "info", title: "New Route Added",
    message: "Route 12 now connects Tirunelveli Junction to Pettai via Town Hall with service every 15 minutes.",
    time: "1 hour ago", read: true,
  },
  {
    id: "a4", type: "resolved", title: "Route 3 Back to Normal",
    message: "The earlier delay on Route 3 (Palayamkottai - NGO Colony) has been resolved. Buses are running on schedule.",
    route: "3", time: "2 hours ago", read: true,
  },
  {
    id: "a5", type: "delay", title: "Route 5 Slow Moving",
    message: "Buses on Route 5 are experiencing slower speeds near Medical College area due to heavy rain.",
    route: "5", time: "30 min ago", read: false,
  },
  {
    id: "a6", type: "info", title: "Holiday Schedule",
    message: "Buses will operate on holiday schedule tomorrow. Frequency may be reduced on all routes. First bus timing remains the same.",
    time: "3 hours ago", read: true,
  },
]

interface NotificationPref {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: React.ElementType
}

const INITIAL_PREFS: NotificationPref[] = [
  { id: "delays", label: "Delay Alerts", description: "Get notified about bus delays", enabled: true, icon: Clock },
  { id: "diversions", label: "Route Changes", description: "Alerts for route diversions", enabled: true, icon: MapPin },
  { id: "arrivals", label: "Arrival Reminders", description: "Bus arriving at your stop", enabled: false, icon: Bus },
  { id: "general", label: "General Updates", description: "Service news and updates", enabled: true, icon: Info },
]

function AlertIcon({ type }: { type: string }) {
  switch (type) {
    case "delay":
      return <AlertTriangle className="h-4 w-4 text-warning" />
    case "diversion":
      return <MapPin className="h-4 w-4 text-destructive" />
    case "resolved":
      return <CheckCircle2 className="h-4 w-4 text-success" />
    default:
      return <Info className="h-4 w-4 text-primary" />
  }
}

function AlertBg({ type }: { type: string }) {
  switch (type) {
    case "delay": return "bg-warning/10"
    case "diversion": return "bg-destructive/10"
    case "resolved": return "bg-success/10"
    default: return "bg-primary/10"
  }
}

export function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [prefs, setPrefs] = useState<NotificationPref[]>(INITIAL_PREFS)
  const [activeTab, setActiveTab] = useState<"alerts" | "settings">("alerts")

  const unreadCount = alerts.filter(a => !a.read).length

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const togglePref = (id: string) => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Alerts" subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up"} />

      {/* Tab switcher */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4">
        <div className="mx-auto flex max-w-lg">
          {[
            { id: "alerts" as const, label: "Notifications", count: unreadCount },
            { id: "settings" as const, label: "Preferences" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg p-4">
          {activeTab === "alerts" ? (
            <>
              {/* Mark all read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark all as read
                </button>
              )}

              <div className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => markAsRead(alert.id)}
                    className={cn(
                      "relative rounded-xl bg-card border p-4 transition-all cursor-pointer",
                      !alert.read ? "border-primary/20 shadow-sm" : "border-border"
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={`Alert: ${alert.title}`}
                  >
                    {!alert.read && (
                      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl", AlertBg({ type: alert.type }))}>
                        <AlertIcon type={alert.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                          {alert.route && (
                            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              Route {alert.route}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id) }}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
                            aria-label="Delete alert"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                      <BellOff className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No alerts</p>
                    <p className="text-xs text-muted-foreground">You are all caught up</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">
                Customize which notifications you receive about bus services.
              </p>
              {prefs.map(pref => {
                const Icon = pref.icon
                return (
                  <div
                    key={pref.id}
                    className="flex items-center gap-3 rounded-xl bg-card border border-border p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <button
                      onClick={() => togglePref(pref.id)}
                      className="flex-shrink-0"
                      aria-label={`${pref.enabled ? "Disable" : "Enable"} ${pref.label}`}
                    >
                      {pref.enabled ? (
                        <ToggleRight className="h-7 w-7 text-primary" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
