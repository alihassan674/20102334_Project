"use client";

import { Settings, Palette, Database, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const settingSections = [
    {
      title: "Appearance",
      description: "Customize the look and feel of your dashboard",
      icon: Palette,
      items: ["Theme", "Accent Color", "Font Size", "Compact Mode"],
    },
    {
      title: "Database",
      description: "Manage database connections and backups",
      icon: Database,
      items: ["Connection String", "Auto Backup", "Data Export", "Seed Data"],
    },
    {
      title: "Security",
      description: "Authentication and access control settings",
      icon: Shield,
      items: ["API Keys", "Session Timeout", "Two-Factor Auth", "Audit Logs"],
    },
    {
      title: "Notifications",
      description: "Configure alerts and notification preferences",
      icon: Bell,
      items: ["Email Alerts", "Occupancy Warnings", "Maintenance Reminders", "Reports"],
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-brand-400" />
          Settings
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Configure your Lodgely platform
        </p>
      </div>

      {/* ── Settings Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingSections.map((section, idx) => (
          <div
            key={section.title}
            className="glass-card rounded-2xl p-6 stat-card animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{section.title}</h2>
                <p className="text-xs text-surface-500 mt-0.5">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors cursor-pointer group"
                >
                  <span className="text-xs text-surface-400 group-hover:text-surface-300 transition-colors">
                    {item}
                  </span>
                  <div className="w-8 h-4 rounded-full bg-surface-700 relative">
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-surface-500 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Platform Info ──────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Platform Info
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Environment", value: "Development" },
            { label: "API Status", value: "Connected" },
            { label: "Database", value: "PostgreSQL" },
          ].map((info) => (
            <div key={info.label}>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">
                {info.label}
              </p>
              <p className="text-sm font-semibold text-surface-300 mt-0.5">
                {info.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
