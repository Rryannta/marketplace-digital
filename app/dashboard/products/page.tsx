import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Edit } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

export default async function MyProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Produk Saya</h1>
          <p className="text-gray-400 mt-2">
            Kelola aset digital yang kamu jual.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500 hover:scale-105"
        >
          <Plus size={18} />
          Tambah Produk
        </Link>
      </div>

      {/* GRID PRODUK */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-[#12121a] border border-white/5 transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              {/* === CONTAINER GAMBAR (Relative) === */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-800">
                {/* 1. GAMBAR PRODUK */}
                <Image
                  src={product.image_url || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* 2. LINK DETAIL (Lapis Transparan Menutupi Gambar - z-10) */}
                <Link
                  href={`/products/${product.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Lihat detail ${product.title}`}
                />

                {/* 3. BADGE KATEGORI (Hiasan) */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10">
                  {product.category}
                </div>

                {/* 4. OVERLAY AKSI (Lapis Paling Atas - z-20) */}
                {/* pointer-events-none di parent agar klik di area hitam TEMBUS ke Link Detail di bawahnya */}
                <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                  {/* Tombol Edit (Aktifkan pointer-events-auto agar bisa diklik) */}
                  <Link
                    href={`/dashboard/products/edit/${product.id}`}
                    className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition transform hover:scale-110"
                    title="Edit Produk"
                  >
                    <Edit size={18} />
                  </Link>

                  {/* Tombol Hapus (Aktifkan pointer-events-auto) */}
                  <div className="pointer-events-auto transform hover:scale-110 transition">
                    <DeleteButton id={product.id} />
                  </div>
                </div>
              </div>

              {/* INFO PRODUK */}
              <div className="p-5">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                    {product.description}
                  </p>
                </Link>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-lg font-bold text-white">
                    {product.price === 0
                      ? "GRATIS"
                      : formatRupiah(product.price)}
                  </span>
                  <span className="text-xs text-gray-500">0 Terjual</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAMPILAN KOSONG */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
          <div className="rounded-full bg-white/5 p-4 mb-4">
            <Package className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Belum ada produk</h3>
          <p className="text-gray-400 mt-2 max-w-sm mx-auto">
            Kamu belum mengupload apapun.
          </p>
          <Link
            href="/dashboard/upload"
            className="mt-6 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold"
          >
            Upload Produk Pertama <Plus size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
