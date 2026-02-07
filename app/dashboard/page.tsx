import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getSellerStats } from "@/app/actions";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Panggil Server Action Statistik
  const stats = await getSellerStats();

  if (!stats) return <div>Loading...</div>; // Safety check

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <p>Pantau performa penjualan aset digitalmu.</p>
        </div>
      </div>

      {/* === 1. KARTU STATISTIK (GRID) === */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Pendapatan */}
        <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-full bg-green-500/20 p-3 text-green-400">
              <DollarSign size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
              <TrendingUp size={12} /> +0%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-400">Total Pendapatan</p>
          <h3 className="text-2xl font-bold text-white">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(stats.totalRevenue)}
          </h3>
        </div>

        {/* Card 2: Penjualan */}
        <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-full bg-blue-500/20 p-3 text-blue-400">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400">Total Penjualan</p>
          <h3 className="text-2xl font-bold text-white">
            {stats.totalSales}{" "}
            <span className="text-sm font-normal text-gray-500">Transaksi</span>
          </h3>
        </div>

        {/* Card 3: Produk */}
        <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-full bg-purple-500/20 p-3 text-purple-400">
              <Package size={24} />
            </div>
            <Link
              href="/dashboard/products"
              className="text-xs font-bold text-purple-400 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <p className="text-sm font-medium text-gray-400">Produk Aktif</p>
          <h3 className="text-2xl font-bold text-white">
            {stats.totalProducts}{" "}
            <span className="text-sm font-normal text-gray-500">Item</span>
          </h3>
        </div>
      </div>

      {/* === 2. TABEL PENJUALAN TERAKHIR === */}
      <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6">
        <h3 className="mb-6 text-xl font-bold text-white">
          Penjualan Terakhir
        </h3>

        {stats.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase text-gray-500">
                  <th className="pb-4">Pembeli</th>
                  <th className="pb-4">Produk</th>
                  <th className="pb-4">Harga</th>
                  <th className="pb-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentSales.map((sale: any, i: number) => (
                  <tr key={i} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 overflow-hidden relative">
                          <Image
                            src={
                              sale.profiles?.avatar_url ||
                              `https://ui-avatars.com/api/?name=User`
                            }
                            alt="Avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-white text-sm">
                          {sale.profiles?.full_name || "Unknown User"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-300">
                      {sale.products?.title || "Produk Dihapus"}
                    </td>
                    <td className="py-4 text-sm font-bold text-green-400">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(sale.amount)}
                    </td>
                    <td className="py-4 text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State untuk Tabel */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 rounded-full bg-white/5 p-4">
              <ShoppingBag className="text-gray-600" />
            </div>
            <p className="text-gray-400">Belum ada penjualan.</p>
            <p className="text-xs text-gray-600">
              Bagikan link produkmu ke media sosial!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
