"use client";

import { Download, Loader2, CreditCard } from "lucide-react";
import {
  getDownloadUrl,
  createTransactionToken,
  verifyTransaction,
} from "@/app/actions";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Kita pakai router untuk refresh yang lebih halus

declare global {
  interface Window {
    snap: any;
  }
}

export default function DownloadButton({
  productId,
  price,
  isPurchased,
}: {
  productId: string;
  price: number;
  isPurchased: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Memproses pembayaran...");

    const result = await createTransactionToken(productId);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      setIsLoading(false);
      return;
    }

    toast.dismiss(toastId);
    if (window.snap) {
      window.snap.pay(result.token, {
        onSuccess: async function (result: any) {
          // 1. Munculkan loading verifikasi
          const verifyToast = toast.loading(
            "Memverifikasi status pembayaran...",
            { id: toastId },
          );

          // 2. Tanya ke server: "Statusnya apa?"
          const verifyRes = await verifyTransaction(result.order_id);

          // 3. Cek Jawabannya
          if (verifyRes.status === "success") {
            toast.success("Pembayaran Lunas! Halaman akan dimuat ulang...", {
              id: verifyToast,
            });

            // Tunggu 1 detik biar user baca notifnya
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            // Kalau masih pending/gagal
            toast.error(
              "Status pembayaran belum terkonfirmasi otomatis. Silakan refresh manual beberapa saat lagi.",
              { id: verifyToast, duration: 5000 },
            );
            setIsLoading(false);
          }
        },
        onPending: function (result: any) {
          toast("Menunggu pembayaran...", { icon: "⏳" });
          setIsLoading(false);
        },
        onError: function (result: any) {
          toast.error("Pembayaran Gagal.");
          setIsLoading(false);
        },
        onClose: function () {
          setIsLoading(false);
        },
      });
    }
  };

  // ... (kode handleDownload SAMA SEPERTI SEBELUMNYA) ...
  const handleDownload = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Menyiapkan file...");
    const result = await getDownloadUrl(productId);

    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else if (result.url) {
      toast.dismiss(toastId);
      toast.success("Download dimulai!");
      window.location.href = result.url;
    }
    setIsLoading(false);
  };

  const canDownload = price === 0 || isPurchased;

  return (
    <button
      onClick={canDownload ? handleDownload : handlePurchase}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white transition disabled:opacity-70 disabled:cursor-not-allowed ${
        canDownload
          ? "bg-green-600 hover:bg-green-500"
          : "bg-cyan-600 hover:bg-cyan-500"
      }`}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : canDownload ? (
        <>
          <Download /> Download Sekarang
        </>
      ) : (
        <>
          <CreditCard /> Beli Sekarang
        </>
      )}
    </button>
  );
}
  