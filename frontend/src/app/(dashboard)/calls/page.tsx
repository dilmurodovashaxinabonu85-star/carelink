"use client";

import { useEffect, useState, useCallback } from "react";

interface Call {
  id: string | number;
  patientname: string;
  medid: string;
  diagnosis: string;
  status: string;
  priority: string;
  duedate?: string;
  createdat?: string;
  updatedat?: string;
  notes?: string;
}

interface AIResult {
  riskLevel: string;
  reason: string;
  recommendations: string[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  NEW: {
    label: "Yangi",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/25",
  },
  IN_PROGRESS: {
    label: "Jarayonda",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/25",
  },
  COMPLETED: {
    label: "Bajarilgan",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/25",
  },
  OVERDUE: {
    label: "Muddati o'tgan",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/25",
  },
};

function getStatusStyle(status: string) {
  return (
    STATUS_MAP[status] || {
      label: status,
      color: "text-slate-400",
      bg: "bg-slate-500/15",
      border: "border-slate-500/25",
    }
  );
}

function getDeadlineCountdown(deadline?: string) {
  if (!deadline) return null;

  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { text: "Muddati o'tgan", urgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { text: `${days} kun ${hours % 24} soat`, urgent: false };
  }

  if (hours > 0) {
    return {
      text: `${hours} soat ${minutes} daqiqa`,
      urgent: hours < 2,
    };
  }

  return { text: `${minutes} daqiqa`, urgent: true };
}

function getRiskBadge(level?: string) {
  const styles: Record<string, string> = {
    HIGH: "bg-red-500/10 text-red-400 border-red-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return styles[level || ""] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [analyzing, setAnalyzing] = useState<string | number | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPatientName, setAiPatientName] = useState("");

  const fetchCalls = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3000/calls", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const list: Call[] = Array.isArray(data) ? data : data.data || [];
      setCalls(list);
    } catch (err) {
      console.error("Calls fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const handleComplete = async (callId: string | number) => {
    setCompleting(callId);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3000/calls/${callId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state immediately
      setCalls((prev) =>
        prev.map((c) =>
          c.id === callId ? { ...c, status: "COMPLETED" } : c
        )
      );
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setCompleting(null);
    }
  };

  const handleAnalyze = async (call: Call) => {
    setAnalyzing(call.id);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3000/calls/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diagnosis: call.diagnosis,
          patientname: call.patientname,
        }),
      });

      if (!res.ok) throw new Error("AI tahlil xatosi");

      const data = await res.json();
      setAiResult(data);
      setAiPatientName(call.patientname || "Bemor");
      setAiModalOpen(true);
    } catch (err) {
      console.error("AI analyze error:", err);
    } finally {
      setAnalyzing(null);
    }
  };

  const filteredCalls =
    filter === "ALL" ? calls : calls.filter((c) => c.status === filter);

  const statusCounts = {
    ALL: calls.length,
    NEW: calls.filter((c) => c.status === "NEW").length,
    IN_PROGRESS: calls.filter((c) => c.status === "IN_PROGRESS").length,
    COMPLETED: calls.filter((c) => c.status === "COMPLETED").length,
    OVERDUE: calls.filter((c) => c.status === "OVERDUE").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Chaqiruvlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Aktiv chaqiruvlar</h1>
          <p className="text-slate-400 text-sm mt-1">
            Barcha chaqiruvlarni boshqarish va kuzatish
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-300">
              {calls.filter((c) => c.status !== "COMPLETED").length} ta faol
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "NEW", "IN_PROGRESS", "COMPLETED", "OVERDUE"] as const).map(
          (status) => {
            const isActive = filter === status;
            const label =
              status === "ALL"
                ? "Barchasi"
                : getStatusStyle(status).label;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border
                  ${
                    isActive
                      ? status === "ALL"
                        ? "bg-white/10 text-white border-white/20"
                        : `${getStatusStyle(status).bg} ${getStatusStyle(status).color} ${getStatusStyle(status).border}`
                      : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.04]"
                  }
                `}
              >
                {label}
                <span
                  className={`ml-1.5 text-xs ${isActive ? "opacity-80" : "opacity-50"}`}
                >
                  {statusCounts[status]}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Calls grid */}
      {filteredCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-900/40 border border-white/[0.04]">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg">
            Hozircha chaqiruvlar mavjud emas
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Yangi chaqiruvlar paydo bo&apos;lganda bu yerda ko&apos;rinadi
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCalls.map((call) => {
            const status = getStatusStyle(call.status);
            const countdown = getDeadlineCountdown(call.duedate);
            const patientName = call.patientname || "Noma'lum bemor";
            const medId = call.medid || "—";
            const diagnosis = call.diagnosis || "—";
            const riskLevel = call.priority;
            const isCompleted = call.status === "COMPLETED";

            return (
              <div
                key={call.id}
                className={`
                  group relative rounded-2xl border transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-slate-900/30 border-white/[0.04] opacity-70"
                      : "bg-slate-900/60 border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20"
                  }
                `}
              >
                {/* Urgent glow for overdue */}
                {call.status === "OVERDUE" && (
                  <div className="absolute inset-0 rounded-2xl bg-red-500/[0.03] pointer-events-none" />
                )}

                <div className="relative p-5">
                  {/* Top row: MED-ID + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {medId}
                      </span>
                      {riskLevel && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${getRiskBadge(riskLevel)}`}
                        >
                          {riskLevel === "HIGH"
                            ? "Yuqori xavf"
                            : riskLevel === "MEDIUM"
                              ? "O'rta xavf"
                              : "Past xavf"}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          call.status === "NEW"
                            ? "bg-blue-400"
                            : call.status === "IN_PROGRESS"
                              ? "bg-amber-400 animate-pulse"
                              : call.status === "COMPLETED"
                                ? "bg-emerald-400"
                                : "bg-red-400 animate-pulse"
                        }`}
                      />
                      {status.label}
                    </span>
                  </div>

                  {/* Patient name */}
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {patientName}
                  </h3>

                  {/* Diagnosis */}
                  <p className="text-slate-400 text-sm flex items-center gap-2 mb-3">
                    <svg
                      className="w-4 h-4 text-slate-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {diagnosis}
                  </p>

                  {/* Deadline countdown */}
                  {countdown && !isCompleted && (
                    <div
                      className={`flex items-center gap-2 text-sm mb-4 ${
                        countdown.urgent ? "text-red-400" : "text-slate-400"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {countdown.urgent ? "⚠ " : ""}
                        {countdown.text} qoldi
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {call.notes && (
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 italic">
                      &ldquo;{call.notes}&rdquo;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                    <button
                      onClick={() => handleComplete(call.id)}
                      disabled={completing === call.id || isCompleted}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed border ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-500/60 border-emerald-500/15"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25 hover:border-emerald-500/30 disabled:opacity-50"
                      }`}
                    >
                      {completing === call.id ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Yuklanmoqda...
                        </>
                      ) : isCompleted ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Bajarildi ✓
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Bajarildi
                        </>
                      )}
                    </button>

                    {/* AI Analysis button */}
                    <button
                      onClick={() => handleAnalyze(call)}
                      disabled={analyzing === call.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 text-sm font-medium hover:bg-purple-500/25 hover:border-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {analyzing === call.id ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Tahlil...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          AI tahlil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Analysis Modal */}
      {aiModalOpen && aiResult && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setAiModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/[0.08] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">AI Tahlil natijasi</h3>
                    <p className="text-slate-400 text-sm">{aiPatientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Risk Level */}
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm font-medium">Xavf darajasi:</span>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                    aiResult.riskLevel === "HIGH"
                      ? "bg-red-500/15 text-red-400 border-red-500/25"
                      : aiResult.riskLevel === "MEDIUM"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  }`}
                >
                  {aiResult.riskLevel === "HIGH"
                    ? "🔴 Yuqori xavf"
                    : aiResult.riskLevel === "MEDIUM"
                      ? "🟡 O'rta xavf"
                      : "🟢 Past xavf"}
                </span>
              </div>

              {/* Reason */}
              <div>
                <h4 className="text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sabab
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  {aiResult.reason}
                </p>
              </div>

              {/* Recommendations */}
              {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Tavsiyalar
                  </h4>
                  <ul className="space-y-2">
                    {aiResult.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-slate-400 bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]"
                      >
                        <span className="w-5 h-5 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/[0.06] text-slate-300 text-sm font-medium hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
