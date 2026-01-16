"use client";

import { updateProduct } from "@/app/actions";
import { Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";
import Image from "next/image";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-4 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Save />} Simpan
      Perubahan
    </button>
  );
}

export default function EditProductForm({ product }: { product: any }) {
  // === SOLUSI: PEMBUNGKUS ACTION ===
  const handleUpdate = async (formData: FormData) => {
    // Panggil server action
    const result = await updateProduct(formData);

    // Jika server action me-return error, kita tampilkan alert
    // Jika server action me-redirect, kode di bawah ini tidak akan jalan (itu yang kita mau)
    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    // Ganti action={updateProduct} menjadi action={handleUpdate}
    <form action={handleUpdate} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />

      {/* ... SISANYA SAMA PERSIS SEPERTI SEBELUMNYA ... */}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Judul Produk
        </label>
        <input
          name="title"
          required
          defaultValue={product.title}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Kategori</label>
        <select
          name="category"
          defaultValue={product.category}
          className="w-full rounded-xl border border-white/10 bg-[#12121a] p-4 text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="Template Web">Template Web</option>
          <option value="Desain & UI">Desain & UI</option>
          <option value="Game Assets">Game Assets</option>
          <option value="E-Books">E-Books</option>
          <option value="Audio">Audio</option>
          <option value="3D Models">3D Models</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Harga (IDR)</label>
        <input
          name="price"
          type="number"
          required
          defaultValue={product.price}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-cyan-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500">* Isi 0 jika Gratis</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Deskripsi</label>
        <textarea
          name="description"
          rows={5}
          required
          defaultValue={product.description}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-dashed border-white/10 p-4">
          <label className="text-sm font-bold text-white">
            Ganti Cover Image
          </label>
          <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-gray-800">
            <Image
              src={product.image_url || "/placeholder.png"}
              alt="Old Cover"
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
              Gambar Saat Ini
            </div>
          </div>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
          />
        </div>

        <div className="space-y-2 rounded-xl border border-dashed border-white/10 p-4">
          <label className="text-sm font-bold text-white">
            Ganti File Produk (ZIP)
          </label>
          <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-white/5 text-gray-500 text-sm border border-white/5">
            File Tersimpan Aman
          </div>
          <input
            name="file"
            type="file"
            accept=".zip,.rar,.pdf"
            className="w-full text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
