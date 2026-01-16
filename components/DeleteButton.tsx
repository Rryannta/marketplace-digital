"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition disabled:opacity-50"
      title="Hapus Produk"
    >
      <Trash2 size={18} />
    </button>
  );
}

export default function DeleteButton({ id }: { id: string }) {
  // SOLUSI: Kita buat fungsi pembungkus (Wrapper)
  // Fungsi ini memanggil server action, tapi tidak me-return object ke form
  const handleDelete = async (formData: FormData) => {
    // Panggil Server Action
    const result = await deleteProduct(formData);

    // (Opsional) Jika mau menangkap error dari server:
    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <form
      action={handleDelete} // <--- Ganti jadi handleDelete
      onSubmit={(e) => {
        if (
          !confirm(
            "Apakah Anda yakin ingin menghapus produk ini secara permanen?"
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}
