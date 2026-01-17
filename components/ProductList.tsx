"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import DeleteButton from "@/components/DeleteButton"; // Tombol hapus satuan
import { deleteProducts } from "@/app/actions"; // Action hapus banyak
import { useRouter } from "next/navigation";

export default function ProductList({ products }: { products: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Fungsi Toggle (Pilih/Batal Pilih)
  const toggleSelect = (id: string) => {
    setSelectedIds(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // Kalau sudah ada, buang
          : [...prev, id] // Kalau belum, tambah
    );
  };

  // Fungsi Pilih Semua
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]); // Batal pilih semua
    } else {
      setSelectedIds(products.map((p) => p.id)); // Pilih semua
    }
  };

  // Eksekusi Hapus Banyak
  const handleBulkDelete = async () => {
    if (
      !confirm(`Yakin ingin menghapus ${selectedIds.length} produk terpilih?`)
    )
      return;

    setIsDeleting(true);
    const result = await deleteProducts(selectedIds);
    setIsDeleting(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setSelectedIds([]); // Reset pilihan
      // Data otomatis refresh karena Server Action melakukan revalidatePath
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <>
      {/* TOMBOL SELECT ALL (Opsional, taruh di atas grid) */}
      <div className="mb-4 flex items-center justify-end">
        {products.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-sm font-medium text-gray-400 hover:text-white transition"
          >
            {selectedIds.length === products.length
              ? "Batal Pilih Semua"
              : "Pilih Semua"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);

          return (
            <div
              key={product.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 
                ${
                  isSelected
                    ? "border-cyan-500 bg-[#12121a]/50 ring-2 ring-cyan-500/50"
                    : "border-white/5 bg-[#12121a] hover:border-cyan-500/30 hover:shadow-2xl"
                }`}
            >
              {/* === CHECKBOX CUSTOM (Pojok Kiri Atas) === */}
              <div
                onClick={() => toggleSelect(product.id)}
                className="absolute top-3 left-3 z-30 cursor-pointer p-1"
              >
                <div
                  className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-cyan-500 border-cyan-500 text-black"
                      : "bg-black/40 border-white/30 hover:border-white text-transparent"
                  }`}
                >
                  <Check size={16} strokeWidth={4} />
                </div>
              </div>

              {/* CONTAINER GAMBAR */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-800">
                <Image
                  src={product.image_url || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Layer Transparan (Biar bisa diklik) */}
                {/* Kalau mode select aktif, klik gambar = pilih checkbox */}
                <div
                  onClick={() => toggleSelect(product.id)}
                  className="absolute inset-0 z-10 cursor-pointer"
                />

                {/* BADGE KATEGORI (Pindah ke Kanan biar gak nabrak checkbox) */}
                <div className="absolute top-3 right-3 z-20 pointer-events-none rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10">
                  {product.category}
                </div>

                {/* OVERLAY BUTTONS (Hanya muncul jika TIDAK sedang dipilih) */}
                {!isSelected && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                    <Link
                      href={`/dashboard/products/edit/${product.id}`}
                      className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition transform hover:scale-110"
                    >
                      <Edit size={18} />
                    </Link>
                    <div className="pointer-events-auto transform hover:scale-110 transition">
                      <DeleteButton id={product.id} />
                    </div>
                  </div>
                )}
              </div>

              {/* INFO PRODUK */}
              <div className="p-5" onClick={() => toggleSelect(product.id)}>
                <div className="flex items-start justify-between gap-2 cursor-pointer">
                  <h3
                    className={`line-clamp-1 text-lg font-bold transition-colors ${isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-400"}`}
                  >
                    {product.title}
                  </h3>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-lg font-bold text-white">
                    {product.price === 0
                      ? "GRATIS"
                      : formatRupiah(product.price)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* === FLOATING ACTION BAR (Muncul jika ada yang dipilih) === */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-white/10 bg-[#12121a] px-6 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-black">
              {selectedIds.length}
            </div>
            <span className="text-sm font-bold text-white">Terpilih</span>
          </div>

          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            Hapus Terpilih
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
