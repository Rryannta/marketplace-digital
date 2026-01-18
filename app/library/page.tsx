import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getLibraryItems } from "@/app/actions";
import Link from "next/link";
import { Library, Search, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard"; // Kita reuse komponen kartu
import Navbar from "@/components/Navbar"; // (Opsional) Jika kamu punya komponen Navbar terpisah
// Kalau tidak punya komponen Navbar terpisah, kita copas navbar manual atau pakai Layout utama

export default async function LibraryPage() {
  const supabase = await createClient();

  // 1. Cek Login (Halaman Privat)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Ambil Data
  const items = await getLibraryItems();

  return (
    <div className="min-h-screen bg-[#05050a] pb-20 pt-24 text-white">
      {/* Header Sederhana (Navbar biasanya sudah ada di layout.tsx) */}

      <div className="mx-auto max-w-7xl px-6">
        {/* Judul Halaman */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
              <Library className="text-cyan-400" />
              Library Saya
            </h1>
            <p className="mt-2 text-gray-400">
              Koleksi aset digital yang sudah kamu miliki.
            </p>
          </div>

          {/* Statistik Kecil */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Aset
            </span>
            <p className="text-2xl font-bold text-white">
              {items.length}{" "}
              <span className="text-sm font-normal text-gray-400">Item</span>
            </p>
          </div>
        </div>

        {/* Grid Produk */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product: any) => (
              <div key={product.id} className="relative group">
                {/* Kita pakai ProductCard yang sudah ada */}
                <ProductCard product={product} />

                {/* Overlay Tambahan Khusus Library (Opsional) */}
                {/* Misalnya badge "Dimiliki" */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="rounded-full bg-green-500/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
                    Sudah Punya
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tampilan Kosong (Empty State) */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
            <div className="mb-4 rounded-full bg-white/5 p-6">
              <ShoppingBag size={48} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Library Masih Kosong
            </h3>
            <p className="max-w-md text-gray-400 mt-2 mb-8">
              Kamu belum membeli atau mendownload aset apapun. Yuk eksplorasi
              aset gratis!
            </p>
            <Link
              href="/"
              className="rounded-full bg-cyan-600 px-8 py-3 font-bold text-white transition hover:bg-cyan-500 hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              Cari Aset Gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
