"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Selamat datang" subtitle="Masuk untuk melihat kalender bersama">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-[#b6dcea] bg-white px-3 py-2.5 text-[#001736] outline-none placeholder:text-[#52677f] focus:border-[#087ba2] focus:ring-1 focus:ring-[#087ba2]/45"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[#b6dcea] bg-white px-3 py-2.5 text-[#001736] outline-none placeholder:text-[#52677f] focus:border-[#087ba2] focus:ring-1 focus:ring-[#087ba2]/45"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-[#f74031]/30 bg-[#fff0ee] px-3 py-2 text-sm text-[#98261c]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00183e] py-2.5 font-semibold text-white transition hover:bg-[#087ba2] disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Masuk
        </button>

        <p className="text-center text-sm text-[#52677f]">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-[#001736] underline decoration-[#00bbfa] underline-offset-4 hover:text-[#00749c]">
            Daftar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}