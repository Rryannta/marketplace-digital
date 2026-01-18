"use client";

import { createProduct } from "@/app/actions";
import {
  Loader2,
  UploadCloud,
  DollarSign,
  FileText,
  Tag,
  Type,
  Image as ImageIcon,
  Box,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-50 disabled:hover:scale-100"
    >
      {pending ? <Loader2 className="animate-spin" /> : <UploadCloud />}
      {pending ? "Mengupload..." : "Upload Produk Sekarang"}
    </button>
  );
}

export default function UploadProductForm() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fungsi untuk menampilkan preview gambar saat dipilih
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleUpload = async (formData: FormData) => {
    const toastId = toast.loading("Sedang mengupload produk...");
    const result = await createProduct(formData);

    if (result?.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Produk berhasil diupload!", { id: toastId });
      setTimeout(() => {
        router.push("/dashboard/products");
        router.refresh();
      }, 1000);
    }
  };

  return (
    <form action={handleUpload} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* === KOLOM KIRI: INPUT TEKS === */}
        <div className="space-y-6">
          {/* Judul */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Type size={14} /> Judul Produk
            </label>
            <input
              name="title"
              required
              placeholder="Contoh: Template Dashboard Admin"
              className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white placeholder-gray-600 transition focus:border-cyan-500 focus:bg-cyan-500/5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Grid Harga & Kategori */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Tag size={14} /> Kategori
              </label>
              <div className="relative">
                <select
                  name="category"
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 p-4 text-white transition focus:border-cyan-500 focus:bg-cyan-500/5 focus:outline-none"
                >
                  <option value="Template Web">Template Web</option>
                  <option value="Desain & UI">Desain & UI</option>
                  <option value="Game Assets">Game Assets</option>
                  <option value="E-Books">E-Books</option>
                  <option value="Audio">Audio</option>
                  <option value="3D Models">3D Models</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <DollarSign size={14} /> Harga (IDR)
              </label>
              <input
                name="price"
                type="number"
                required
                defaultValue={0}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white transition focus:border-cyan-500 focus:bg-cyan-500/5 focus:outline-none"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <FileText size={14} /> Deskripsi
            </label>
            <textarea
              name="description"
              rows={6}
              required
              placeholder="Jelaskan fitur utama produkmu..."
              className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white placeholder-gray-600 transition focus:border-cyan-500 focus:bg-cyan-500/5 focus:outline-none"
            />
          </div>
        </div>

        {/* === KOLOM KANAN: UPLOAD MEDIA === */}
        <div className="space-y-6">
          {/* Upload Cover Image */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <ImageIcon size={14} /> Cover Image
            </label>
            <label className="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-black/20 transition hover:border-cyan-500 hover:bg-cyan-500/5">
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover opacity-80 transition group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                      Ganti Gambar
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 transition group-hover:text-cyan-400">
                  <div className="rounded-full bg-white/5 p-4 group-hover:scale-110 transition">
                    <UploadCloud size={32} />
                  </div>
                  <span className="text-sm font-medium">
                    Klik untuk upload cover
                  </span>
                  <span className="text-[10px] text-gray-600">
                    JPG, PNG, WEBP (Max 5MB)
                  </span>
                </div>
              )}
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Upload File Produk */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Box size={14} /> File Aset (ZIP/RAR)
            </label>
            <label className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 transition hover:border-cyan-500 hover:bg-cyan-500/5">
              <div className="flex flex-col items-center gap-2 text-gray-500 transition group-hover:text-cyan-400">
                <Box size={24} />
                <span className="text-sm font-medium">Upload file ZIP/PDF</span>
              </div>
              <input
                name="file"
                type="file"
                accept=".zip,.rar,.pdf"
                required
                className="hidden"
              />
            </label>
          </div>

          {/* Tips Card */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-200">
            <p className="font-bold mb-1">💡 Tips Penjualan:</p>
            <p>
              Gunakan gambar cover yang menarik dan deskripsi yang jelas untuk
              meningkatkan peluang penjualan.
            </p>
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
