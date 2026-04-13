"use client";

import { useEffect, useState } from "react";

interface CallStats {
  today: number;
  delayed: number;
  completed: number;
  mine: number;
}

interface Call {
  id: string;
  patientname: string;
  medid: string;
  diagnosis: string;
  status: string;
  priority: string;
  duedate: string;
  createdat: string;
  updatedat: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<CallStats>({
    today: 0,
    delayed: 0,
    completed: 0,
    mine: 0,
  });
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:3000/calls", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const calls: Call[] = Array.isArray(data) ? data : data.data || [];

        const overdue = calls.filter((c) => c.status === "OVERDUE").length;
        const completed = calls.filter((c) => c.status === "COMPLETED").length;

        setStats({
          today: calls.length,
          delayed: overdue,
          completed: completed,
          mine: calls.filter((c) => c.status === "NEW").length,
        });

        setRecentCalls(calls.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metricCards = [
    {
      title: "Bugungi chaqiruvlar",
      value: stats.today,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Kechikkanlar",
      value: stats.delayed,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Bajarilganlar",
      value: stats.completed,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Mening chaqiruvlarim",
      value: stats.mine,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500",
      borderColor: "border-violet-500/20",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      IN_PROGRESS: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      OVERDUE: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/20";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: "Yangi",
      IN_PROGRESS: "Jarayonda",
      COMPLETED: "Bajarilgan",
      OVERDUE: "Muddati o'tgan",
    };
    return labels[status] || status;
  };

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: "bg-red-500",
      MEDIUM: "bg-amber-500",
      LOW: "bg-emerald-500",
    };
    return colors[priority] || "bg-slate-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Ma&apos;lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Bugungi chaqiruvlar va umumiy statistika
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-sm border ${card.borderColor} p-5 group hover:border-opacity-40 transition-all duration-300`}
          >
            {/* Background glow */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 ${card.bgGlow} opacity-[0.07] rounded-full blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}
              >
                <span className="text-white">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent calls table */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">So&apos;nggi chaqiruvlar</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Oxirgi 5 ta chaqiruv
            </p>
          </div>
          <a
            href="/calls"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            Barchasini ko&apos;rish
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {recentCalls.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-400 text-sm">
              Hozircha chaqiruvlar mavjud emas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Bemor
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Muhimlik
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vaqt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-300 font-mono">
                      #{call.id}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white">
                      {call.patientname || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadge(call.status)}`}
                      >
                        {getStatusLabel(call.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${getPriorityDot(call.priority)}`}
                        />
                        <span className="text-sm text-slate-400">
                          {call.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">
                      {new Date(call.createdat).toLocaleDateString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
