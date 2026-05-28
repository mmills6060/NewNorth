"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

type DashboardTab = "jobs" | "companies"

interface DashboardTabsProps {
  jobsPanel: React.ReactNode
  companiesPanel: React.ReactNode
}

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "jobs", label: "Open roles" },
  { id: "companies", label: "Companies" },
]

export function DashboardTabs({ jobsPanel, companiesPanel }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("jobs")

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="inline-flex h-9 w-fit items-center rounded-lg border border-border bg-muted p-0.5"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" hidden={activeTab !== "jobs"}>
        {activeTab === "jobs" ? jobsPanel : null}
      </div>
      <div role="tabpanel" hidden={activeTab !== "companies"}>
        {activeTab === "companies" ? companiesPanel : null}
      </div>
    </div>
  )
}
