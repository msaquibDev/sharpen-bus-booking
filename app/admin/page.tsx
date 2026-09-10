"use client";

import { useEffect, useState } from "react";
import {
  BusFront,
  CalendarDays,
  Download,
  LogOut,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch("/api/admin/bookings/csv", {
          method: "HEAD",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }

        setChecking(false);
      } catch {
        router.replace("/admin/login");
      }
    }

    void checkAccess();
  }, [router]);

  async function downloadCsv() {
    setDownloading(true);

    try {
      const response = await fetch("/api/admin/bookings/csv", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to download CSV.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "sharpen-the-edge-bus-bookings-2026-09-12.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV download error:", error);

      alert("Unable to download CSV. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.replace("/");
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <BusFront size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>

              <p className="text-sm text-slate-500">
                Sharpen The Edge — 2026 National Convention
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* Download card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <FileSpreadsheet size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Bus Booking Report
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Download the confirmed bus bookings for
              <strong className="text-slate-700"> 12 September 2026</strong>.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <CalendarDays size={17} />

              <span>Saturday, 12 September 2026</span>
            </div>

            <button
              type="button"
              onClick={downloadCsv}
              disabled={downloading}
              className="mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={19} />

              {downloading ? "Preparing CSV..." : "Download Booking CSV"}
            </button>

            <p className="mt-4 text-xs text-slate-400">
              This file contains confirmed passenger booking information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
