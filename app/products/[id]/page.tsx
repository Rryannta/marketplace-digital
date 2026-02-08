import { createClient } from "@/utils/supabase/server";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import { Share2, ShieldCheck, Download, Star } from "lucide-react";
import { notFound } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";
import Link from "next/link"; // <--- 1. Import Link

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Ambil Data Produk
  const { data: product, error } = await supabase
    .from("products")
    .select(`*, profiles ( full_name, avatar_url )`)
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  // 2. CEK APAKAH USER SUDAH BELI?
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isPurchased = false;

  if (user) {
    const { data: transaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "success")
      .single();

    if (transaction || product.user_id === user.id) {
      isPurchased = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#05050a] pb-20 pt-10 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <BackButton />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* KOLOM KIRI: GAMBAR */}
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

            {/* Trust Badges */}
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

          {/* KOLOM KANAN: INFO */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400 border border-cyan-500/20">
                {product.category}
              </span>
              <button className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white">
                <Share2 size={20} />
              </button>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              {product.title}
            </h1>

            {/* === 2. MODIFIKASI BAGIAN PROFILE === */}
            {/* Bungkus seluruh div ini dengan Link ke halaman seller */}
            <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-8">
              <Link
                href={`/seller/${product.user_id}`}
                className="group flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-gray-700 relative group-hover:border-cyan-400 transition-colors">
                  <Image
                    src={
                      product.profiles?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${
                        product.profiles?.full_name || "User"
                      }`
                    }
                    alt="Seller"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {product.profiles?.full_name || "Unknown Creator"}
                  </p>
                </div>
              </Link>
            </div>
            {/* =================================== */}

            <div className="mb-6">
              <span className="text-3xl font-bold text-cyan-400">
                {product.price === 0
                  ? "GRATIS"
                  : new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(product.price)}
              </span>
            </div>

            <div className="mb-8">
              <DownloadButton
                productId={product.id}
                price={product.price}
                isPurchased={isPurchased}
              />
            </div>

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
