import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl p-4 sm:p-6">{children}</div>
    </AuthGuard>
  );
}