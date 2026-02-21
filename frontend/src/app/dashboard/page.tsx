"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ShieldStats {
  shield_score: number;
  transactions_analyzed: number;
  threats_blocked: number;
  receipts_generated: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  href,
  accentClass,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  href: string;
  accentClass: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-border p-5 rounded-xl hover:border-border-light transition-all shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-text-secondary">{label}</p>
        {trend && (
          <span className="text-xs text-success flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
    </Link>
  );
}

interface RecentEvent {
  id: string;
  event_type: string;
  target_address: string;
  risk_score: number;
  chain: string;
  created_at: string;
}

function RecentActivity({ events }: { events: RecentEvent[] }) {
  const riskColor = (score: number) => {
    if (score >= 70) return "text-danger";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const eventLabel: Record<string, string> = {
    tx_analysis: "Transaction",
    contract_analysis: "Contract",
    receipt: "Receipt",
    revoke: "Revoke",
  };

  if (events.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center shadow-sm">
        <Activity className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary text-sm">
          No activity yet.{" "}
          <Link href="/dashboard/analyze" className="text-text-primary underline underline-offset-2 font-medium">
            Analyze your first transaction
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl divide-y divide-border shadow-sm">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between p-4 first:rounded-t-xl last:rounded-b-xl"
        >
          <div className="min-w-0">
            <p className="font-medium text-text-primary text-sm">
              {eventLabel[event.event_type] ?? event.event_type}
            </p>
            <p className="text-xs text-text-muted truncate mt-0.5">
              {event.target_address}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-text-muted capitalize">
              {event.chain}
            </span>
            <span className={`text-sm font-semibold ${riskColor(event.risk_score)}`}>
              {event.risk_score}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ShieldStats>({
    shield_score: 0,
    transactions_analyzed: 0,
    threats_blocked: 0,
    receipts_generated: 0,
  });
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = (await apiClient("/shield/status/me")) as Record<string, unknown>;
        if (data) {
          setStats({
            shield_score: (data.shield_score as number) ?? 85,
            transactions_analyzed: (data.transactions_analyzed as number) ?? 0,
            threats_blocked: (data.threats_blocked as number) ?? 0,
            receipts_generated: (data.receipts_generated as number) ?? 0,
          });
          setEvents((data.recent_events as RecentEvent[]) ?? []);
        }
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Your security overview at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Shield Score"
          value={loading ? "—" : stats.shield_score}
          icon={ShieldCheck}
          href="/dashboard"
          accentClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Transactions Analyzed"
          value={loading ? "—" : stats.transactions_analyzed}
          icon={Activity}
          trend="+12%"
          href="/dashboard/analyze"
          accentClass="bg-accent/10 text-accent"
        />
        <StatCard
          label="Threats Blocked"
          value={loading ? "—" : stats.threats_blocked}
          icon={AlertTriangle}
          href="/dashboard/panic"
          accentClass="bg-warning/10 text-warning"
        />
        <StatCard
          label="Receipts"
          value={loading ? "—" : stats.receipts_generated}
          icon={Receipt}
          href="/dashboard/receipts"
          accentClass="bg-success/10 text-success"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/analyze"
          className="bg-white border border-border rounded-xl p-5 hover:border-border-light transition-all group shadow-sm"
        >
          <h3 className="font-medium text-text-primary group-hover:text-text-primary transition-colors">
            Analyze Transaction
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Simulate any Tx before signing
          </p>
        </Link>
        <Link
          href="/dashboard/receipts"
          className="bg-white border border-border rounded-xl p-5 hover:border-border-light transition-all group shadow-sm"
        >
          <h3 className="font-medium text-text-primary group-hover:text-text-primary transition-colors">
            Generate Receipt
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Create a shareable receipt card
          </p>
        </Link>
        <Link
          href="/dashboard/panic"
          className="bg-white border border-border rounded-xl p-5 hover:border-border-light transition-all group shadow-sm"
        >
          <h3 className="font-medium text-text-primary group-hover:text-text-primary transition-colors">
            Panic Revoke
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Scan &amp; revoke risky approvals
          </p>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <RecentActivity events={events} />
      </div>
    </div>
  );
}
