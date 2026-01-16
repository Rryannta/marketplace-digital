import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Upload,
  Settings,
  LogOut,
  Download,
  Home,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Cek apakah user login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ambil data profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-[#05050a] text-white selection:bg-cyan-500/30">
      {/* === SIDEBAR KIRI (Tetap) === */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="flex h-full flex-col px-6 py-8">
          {/* Info User */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 shadow-lg shadow-cyan-500/20">
              <img
                src={
                  profile?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.email}`
                }
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-white">
                {profile?.full_name || "Pengguna"}
              </p>
              <p className="truncate text-xs text-cyan-400 font-medium">
                Member Area
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <div className="mb-6 pb-6 border-b border-white/5">
              <NavItem
                href="/"
                icon={<Home size={20} />}
                label="Ke Beranda Utama"
              />
            </div>

            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Saya Pembeli
            </p>
            <NavItem
              href="/dashboard/library"
              icon={<Download size={20} />}
              label="Library / Unduhan"
            />
            <NavItem
              href="/dashboard/settings"
              icon={<Settings size={20} />}
              label="Pengaturan Akun"
            />

            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 mt-8">
              Saya Kreator
            </p>
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Ringkasan"
            />
            <NavItem
              href="/dashboard/products"
              icon={<Package size={20} />}
              label="Produk Saya"
            />
            <NavItem
              href="/dashboard/upload"
              icon={<Upload size={20} />}
              label="Upload Produk Baru"
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* === PEMBUNGKUS KONTEN === */}
      {/* Bagian ini yang membuat background halaman upload jadi gelap */}
      <main className="ml-64 min-h-screen w-full p-8 bg-gradient-to-b from-[#0a0a0f] to-black">
        <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white hover:pl-5"
    >
      <span className="group-hover:text-cyan-400 transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}
