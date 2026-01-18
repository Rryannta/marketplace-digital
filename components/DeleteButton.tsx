"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions";
import { useFormStatus } from "react-dom";
import Swal from "sweetalert2"; // <--- Import SweetAlert
import toast from "react-hot-toast"; // <--- Import Toast

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit" // Pastikan type submit agar form jalan
      className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition disabled:opacity-50"
      title="Hapus Produk"
    >
      <Trash2 size={18} />
    </button>
  );
}

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async (formData: FormData) => {
    // 1. Tampilkan Konfirmasi Cantik (SweetAlert)
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      background: "#1f2937", // Warna gelap biar match tema
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Merah
      cancelButtonColor: "#6b7280", // Abu-abu
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    // 2. Jika user klik Cancel, stop proses
    if (!result.isConfirmed) return;

    // 3. Tampilkan Loading Toast
    const toastId = toast.loading("Menghapus produk...");

    // 4. Eksekusi Server Action
    const actionResult = await deleteProduct(formData);

    // 5. Update status Toast
    if (actionResult?.error) {
      toast.error(actionResult.error, { id: toastId });
    } else {
      toast.success("Produk berhasil dihapus!", { id: toastId });
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}
