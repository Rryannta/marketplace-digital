"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UploadCloud,
  X,
  DollarSign,
  FileBox,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

// Kategori tetap (Fixed List)
const CATEGORIES = [
  "Template Web & App",
  "Desain & UI/UX",
  "Game Assets",
  "E-Books & Kursus",
  "Audio & Video",
  "Plugins & Tools",
  "Lainnya",
];

export default function UploadPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // File State
  const [productFile, setProductFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Handle Cover Image Upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle Product File Upload (ZIP/PDF)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
    }
  };

  // LOGIKA UPLOAD (SAMA SEPERTI SEBELUMNYA)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFile || !coverImage || !title || !price || !category) {
      alert("Mohon lengkapi semua data dan file!");
      return;
    }

    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Anda harus login");

      // 1. Upload Cover
      const coverExt = coverImage.name.split(".").pop();
      const coverName = `covers/${Date.now()}_${Math.random()}.${coverExt}`;
      const { error: coverError } = await supabase.storage
        .from("public-files")
        .upload(coverName, coverImage);

      if (coverError) throw coverError;

      // 2. Upload File Produk
      const fileExt = productFile.name.split(".").pop();
      const fileName = `products/${user.id}/${Date.now()}.${fileExt}`;
      const { error: fileError } = await supabase.storage
        .from("product-files")
        .upload(fileName, productFile);

      if (fileError) throw fileError;

      // 3. Simpan ke Database
      const coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-files/${coverName}`;

      const { error: dbError } = await supabase.from("products").insert({
        title,
        description,
        price: parseInt(price),
        category,
        image_url: coverUrl,
        file_url: fileName,
        user_id: user.id,
      });

      if (dbError) throw dbError;

      alert("Produk berhasil diupload!");
      router.push("/dashboard/products");
      router.refresh();
    } catch (error: any) {
      alert("Gagal Upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Upload Produk Baru
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          Bagikan karyamu ke ribuan pembeli potensial.
        </p>
      </motion.div>

      <form onSubmit={handleUpload} className="space-y-8">
        {/* --- SECTION 1: MEDIA UPLOAD (Dark Card Theme) --- */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-8 rounded-[2.5rem] bg-[#1B1E20] border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Background Glow Effect */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Cover Image Area (Left - Smaller) */}
          <div className="md:col-span-2 space-y-4 relative z-10">
            <Label className="text-gray-300 font-medium pl-1">
              Cover Thumbnail
            </Label>
            <div
              className={`group relative flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden ${
                coverPreview
                  ? "border-blue-500/50"
                  : "border-white/10 hover:border-blue-400/50 hover:bg-white/5"
              }`}
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverPreview(null);
                      }}
                      className="p-3 bg-red-500/80 rounded-full hover:bg-red-600 text-white transition scale-90 group-hover:scale-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                  <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                    Upload Cover
                  </span>
                  <span className="text-xs text-gray-500 mt-2">
                    JPG, PNG (Max 2MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product File Area (Right - Larger) */}
          <div className="md:col-span-3 space-y-4 relative z-10">
            <Label className="text-gray-300 font-medium pl-1">
              File Produk Utama
            </Label>
            <div
              className={`relative flex flex-col items-center justify-center h-full min-h-[250px] border-2 border-dashed rounded-3xl transition-all duration-300 group ${
                productFile
                  ? "border-[#6A67F3]/50 bg-[#6A67F3]/5"
                  : "border-white/10 hover:border-blue-400/50 hover:bg-white/5"
              }`}
            >
              {productFile ? (
                <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="h-14 w-14 text-[#6A67F3] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(106,103,243,0.5)]" />
                  <p className="text-lg text-white font-semibold truncate max-w-[250px] mx-auto">
                    {productFile.name}
                  </p>
                  <p className="text-sm text-[#6A67F3] mt-2 font-medium">
                    Siap diupload ({(productFile.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => setProductFile(null)}
                    className="px-6 py-2 mt-6 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all"
                  >
                    Batalkan & Ganti File
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-8 text-center">
                  <div className="p-5 rounded-full bg-white/5 mb-6 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                    <UploadCloud className="h-12 w-12 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-xl font-semibold text-gray-200 group-hover:text-white">
                    Drag & Drop file di sini
                  </span>
                  <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">
                    Atau klik untuk memilih file ZIP, PDF, atau RAR. Ini adalah
                    file yang akan diterima pembeli.
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: DETAIL INFO (Dark Card Theme) --- */}
        <div className="space-y-8 p-8 rounded-[2.5rem] bg-[#1B1E20] border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="space-y-3 relative z-10 group">
            <Label
              htmlFor="title"
              className="text-gray-300 pl-1 group-focus-within:text-blue-400 transition-colors"
            >
              Judul Produk
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Ultimate 3D Asset Pack 2024"
              className="h-14 px-5 rounded-2xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3 group">
              <Label className="text-gray-300 pl-1 group-focus-within:text-blue-400 transition-colors">
                Kategori
              </Label>
              <Select onValueChange={setCategory}>
                <SelectTrigger className="h-14 px-5 rounded-2xl bg-black/30 border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm">
                  <SelectValue placeholder="Pilih Kategori Produk" />
                </SelectTrigger>
                <SelectContent className="bg-[#1B1E20] border-white/10 text-gray-200 rounded-xl p-2">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="rounded-lg focus:bg-blue-500/20 focus:text-white cursor-pointer py-3"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 group">
              <Label
                htmlFor="price"
                className="text-gray-300 pl-1 group-focus-within:text-green-400 transition-colors"
              >
                Harga (IDR)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="price"
                  type="number"
                  placeholder="50000"
                  className="h-14 pl-12 pr-5 rounded-2xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:border-green-500 transition-all shadow-sm font-medium"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 pl-1 mt-1">
                Masukkan angka 0 jika ingin menggratiskan produk.
              </p>
            </div>
          </div>

          <div className="space-y-3 relative z-10 group">
            <Label
              htmlFor="desc"
              className="text-gray-300 pl-1 group-focus-within:text-blue-400 transition-colors"
            >
              Deskripsi Lengkap
            </Label>
            <Textarea
              id="desc"
              placeholder="Jelaskan fitur, kelengkapan, dan keunggulan produkmu secara detail..."
              className="min-h-[180px] p-5 rounded-2xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all shadow-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON ACTION */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.back()}
            className="px-6 h-12 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Batalkan
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.8)] transition-all duration-300 scale-[1.01] hover:scale-[1.03] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Sedang Mengupload...
              </>
            ) : (
              "Publikasikan Sekarang"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
