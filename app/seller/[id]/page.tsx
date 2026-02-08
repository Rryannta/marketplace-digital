// app/seller/[id]/page.tsx

import { createClient } from "@/utils/supabase/server";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { MapPin, Calendar, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>; // Perbaikan untuk Next.js terbaru (Params harus awaitable/Promise)
}) {
  const { id } = await params; // Await params dulu
  const supabase = await createClient();

  // 1. Ambil Data Profil Seller
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) return notFound(); // Jika user tidak ditemukan

  // 2. Ambil Produk Buatan Seller Ini
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      *,
      profiles ( full_name, avatar_url )
    `,
    )
    .eq("user_id", id)
    .eq("is_archived", false) // Hanya tampilkan yang aktif
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#05050a] text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Home
        </Link>

        {/* HEADER PROFIL SELLER */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f16] p-8 md:p-10">
          {/* Background Hiasan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Besar */}
            <div className="relative h-32 w-32 rounded-full border-4 border-[#05050a] shadow-2xl overflow-hidden bg-gray-800">
              <Image
                src={
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${profile.full_name}&size=256`
                }
                alt={profile.full_name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info Text */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile.full_name}
              </h1>
              <p className="text-gray-400 max-w-lg mb-6 mx-auto md:mx-0">
                Seorang kreator digital di MarketplaceKita. Lihat koleksi aset
                terbaiknya di bawah ini.
              </p>

              {/* Stats Kecil */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Package size={16} className="text-cyan-400" />
                  <span className="font-bold text-white">
                    {products?.length || 0}
                  </span>{" "}
                  Produk
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Calendar size={16} className="text-purple-400" />
                  Bergabung 2026
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRID PRODUK MEREKA */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Koleksi Produk</h2>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500">
              Seller ini belum memiliki produk aktif.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
