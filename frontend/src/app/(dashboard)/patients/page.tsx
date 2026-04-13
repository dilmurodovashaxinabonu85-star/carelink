"use client";

import { useEffect, useState, useMemo } from "react";

interface Patient {
  id: string;
  medid: string;
  firstname: string;
  lastname: string;
  diagnosis: string;
  risklevel: string;
  phone: string;
  address: string;
  createdat?: string;
}

function getRiskStyle(level: string) {
  const styles: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    HIGH: {
      label: "Yuqori xavf",
      color: "text-red-400",
      bg: "bg-red-500/15",
      border: "border-red-500/25",
      dot: "bg-red-500",
    },
    MEDIUM: {
      label: "O'rta xavf",
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/25",
      dot: "bg-amber-500",
    },
    LOW: {
      label: "Past xavf",
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/25",
      dot: "bg-emerald-500",
    },
  };
  return styles[level] || {
    label: level,
    color: "text-slate-400",
    bg: "bg-slate-500/15",
    border: "border-slate-500/25",
    dot: "bg-slate-500",
  };
}

const avatarColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-rose-500 to-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:3000/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const list: Patient[] = Array.isArray(data) ? data : data.data || [];
        setPatients(list);
      } catch (err) {
        console.error("Patients fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        (p.firstname && p.firstname.toLowerCase().includes(q)) ||
        (p.lastname && p.lastname.toLowerCase().includes(q)) ||
        (p.medid && p.medid.toLowerCase().includes(q)) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
    );
  }, [patients, search]);

  const riskCounts = {
    HIGH: patients.filter((p) => p.risklevel === "HIGH").length,
    MEDIUM: patients.filter((p) => p.risklevel === "MEDIUM").length,
    LOW: patients.filter((p) => p.risklevel === "LOW").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Bemorlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Bemorlar</h1>
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 text-sm font-semibold">
            {patients.length}
          </span>
        </div>

        {/* Risk summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-red-400 font-medium">{riskCounts.HIGH} yuqori</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-medium">{riskCounts.MEDIUM} o&apos;rta</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-medium">{riskCounts.LOW} past</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Ism, familiya yoki MED-ID bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search results count */}
      {search && (
        <p className="text-slate-500 text-sm">
          {filtered.length} ta natija topildi
        </p>
      )}

      {/* Patients grid */}
      {filtered.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg">
            {search ? "Bemor topilmadi" : "Hozircha bemorlar mavjud emas"}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {search
              ? "Boshqa kalit so'z bilan qidirib ko'ring"
              : "Yangi bemorlar qo'shilganda bu yerda ko'rinadi"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const fullName = `${patient.firstname || ""} ${patient.lastname || ""}`.trim() || "Noma'lum";
            const initial = (patient.firstname || "?")[0].toUpperCase();
            const risk = getRiskStyle(patient.risklevel);
            const color = getAvatarColor(fullName);

            return (
              <div
                key={patient.id || patient.medid}
                className="group relative rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 transition-all duration-300 overflow-hidden"
              >
                {/* Risk indicator strip */}
                <div className={`absolute top-0 left-0 w-1 h-full ${risk.dot} opacity-60 rounded-l-2xl`} />

                <div className="p-5 pl-6">
                  {/* Top: avatar + name + risk */}
                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0`}
                    >
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate">
                        {fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {patient.medid || "—"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${risk.bg} ${risk.color} ${risk.border}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${risk.dot}`} />
                          {risk.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="flex items-start gap-2 mb-3">
                    <svg
                      className="w-4 h-4 text-slate-500 shrink-0 mt-0.5"
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
                    <span className="text-slate-400 text-sm leading-snug">
                      {patient.diagnosis || "Tashxis ko'rsatilmagan"}
                    </span>
                  </div>

                  {/* Info row: phone + address */}
                  <div className="space-y-1.5 pt-3 border-t border-white/[0.04]">
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-3.5 h-3.5 text-slate-500 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a
                          href={`tel:${patient.phone}`}
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {patient.phone}
                        </a>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-3.5 h-3.5 text-slate-500 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-slate-400">{patient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
