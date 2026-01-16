"use client";

import { useState } from "react";
import { Download, ShoppingCart, Loader2 } from "lucide-react";
import { getDownloadUrl } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ProductAction({
  productId,
  price,
  fileUrl,
}: {
  productId: string;
  price: number;
  fileUrl: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async () => {
    if (!fileUrl) {
      alert("File produk ini belum diupload oleh penjual.");
      return;
    }

    setLoading(true);

    try {
      if (price === 0) {
        // === LOGIKA GRATIS (SILENT DOWNLOAD) ===
        const result = await getDownloadUrl(productId);

        if (result.error) {
          alert(result.error);
        } else if (result.url) {
          // TRIK BARU: Buat elemen link "hantu" (tidak terlihat)
          const link = document.createElement("a");
          link.href = result.url;
          link.setAttribute("download", ""); // Memberi tahu browser ini untuk didownload
          document.body.appendChild(link);

          // Klik link tersebut secara otomatis
          link.click();

          // Hapus link setelah selesai
          document.body.removeChild(link);
        }
      } else {
        alert("Fitur pembayaran akan segera hadir!");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#1B1E20] to-[#12121a] p-6 border border-white/10 shadow-xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">Total Harga</p>
          <p className="text-3xl font-bold text-white">
            {price === 0
              ? "GRATIS"
              : new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(price)}
          </p>
        </div>
      </div>

      <button
        onClick={handleAction}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98]
            ${
              price === 0
                ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/25 hover:shadow-green-500/40"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40"
            }
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Memproses...
          </>
        ) : price === 0 ? (
          <>
            <Download size={24} /> Download Sekarang
          </>
        ) : (
          <>
            <ShoppingCart size={24} /> Beli Sekarang
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-gray-500">
        {price === 0
          ? "File aman dan bebas virus. Klik untuk unduh langsung."
          : "File otomatis terkirim ke email & dashboard setelah pembayaran."}
      </p>
    </div>
  );
}
