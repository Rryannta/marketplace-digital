import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, ShieldCheck, Download, Star } from "lucide-react";
import { notFound } from "next/navigation";

// Tipe data untuk parameter URL (Dynamic Route)
interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Await params dulu (update terbaru Next.js butuh ini)
  const { id } = await params;

  console.log("📢 MENGAKSES HALAMAN PRODUK ID:", id); // <--- CCTV 1

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .single();

  console.log("✅ DATA DARI DB:", product); // <--- CCTV 2
  console.log("❌ ERROR DARI DB:", error); // <--- CCTV 3

  // Jika produk tidak ditemukan / error
  if (error || !product) {
    console.log("💀 KEPUTUSAN: LEMPAR KE 404"); // <--- CCTV 4
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#05050a] pb-20 pt-10 text-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* === KOLOM KIRI: GAMBAR === */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#12121a] shadow-2xl shadow-cyan-500/5">
              <Image
                src={product.image_url || "/placeholder.png"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Fitur Jaminan (Trust Badges) */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="text-green-400" size={24} />
                <span className="text-[10px] font-medium text-gray-300">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 border-l border-white/10">
                <Download className="text-cyan-400" size={24} />
                <span className="text-[10px] font-medium text-gray-300">
                  Instant Download
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 border-l border-white/10">
                <Star className="text-yellow-400" size={24} />
                <span className="text-[10px] font-medium text-gray-300">
                  Original Quality
                </span>
              </div>
            </div>
          </div>

          {/* === KOLOM KANAN: INFO & BELI === */}
          <div className="flex flex-col justify-center">
            {/* Kategori & Share */}
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400 border border-cyan-500/20">
                {product.category}
              </span>
              <button className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white">
                <Share2 size={20} />
              </button>
            </div>

            {/* Judul */}
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              {product.title}
            </h1>

            {/* Info Penjual */}
            <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-8">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
                <Image
                  src={
                    product.profiles?.avatar_url ||
                    `https://ui-avatars.com/api/?name=User`
                  }
                  alt="Seller"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <p className="text-sm text-gray-400">Created by</p>
                <p className="font-bold text-white">
                  {product.profiles?.full_name || "Unknown Creator"}
                </p>
              </div>
            </div>

            {/* Harga & Tombol Beli */}
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#1B1E20] to-[#12121a] p-6 border border-white/10 shadow-xl">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Total Harga
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {product.price === 0
                      ? "GRATIS"
                      : formatRupiah(product.price)}
                  </p>
                </div>
              </div>

              <button className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]">
                {product.price === 0 ? "Download Sekarang" : "Beli Sekarang"}
              </button>
              <p className="mt-4 text-center text-xs text-gray-500">
                File otomatis terkirim ke email & dashboard setelah pembayaran.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Deskripsi Produk</h3>
              <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-sm">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
