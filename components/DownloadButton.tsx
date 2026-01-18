"use client";

import { Download, Loader2 } from "lucide-react";
import { getDownloadUrl } from "@/app/actions";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DownloadButton({
  productId,
  price,
}: {
  productId: string;
  price: number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    // Loading toast (opsional, karena prosesnya biasanya cepat)
    const toastId = toast.loading("Menyiapkan file...");

    try {
      const result = await getDownloadUrl(productId);

      if (result.error) {
        // Tampilkan Error Cantik
        toast.error(result.error, { id: toastId });
      } else if (result.url) {
        // Sukses! Tutup toast loading
        toast.dismiss(toastId);
        toast.success("Download dimulai!", { duration: 3000 });

        // Trigger download browser
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Teks Tombol
  const buttonText = price === 0 ? "Download Gratis" : "Beli Sekarang";
  const buttonColor =
    price === 0
      ? "bg-green-600 hover:bg-green-500"
      : "bg-cyan-600 hover:bg-cyan-500";

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white transition ${buttonColor} disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Download />}
      {isLoading ? "Memproses..." : buttonText}
    </button>
  );
}
