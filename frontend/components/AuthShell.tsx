import { CalendarDays } from "lucide-react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#79d7fd]/45 bg-white/95 p-8 text-[#001736] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#00183e] text-[#79d7fd]">
            <CalendarDays className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-[#52677f]">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}