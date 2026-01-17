"use client";

import { updateProfile } from "@/app/actions";
import { Loader2, Save, User, Camera } from "lucide-react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Save size={18} />}{" "}
      Simpan Profil
    </button>
  );
}

export default function ProfileForm({ profile }: { profile: any }) {
  const [preview, setPreview] = useState(profile.avatar_url);

  // Fungsi preview gambar sebelum upload (Biar UX bagus)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    const result = await updateProfile(formData);
    if (result?.error) {
      alert(result.error);
    } else {
      alert("Profil berhasil diperbarui!");
    }
  };

  return (
    <form action={handleUpdate} className="max-w-xl">
      {/* UPDATE AVATAR */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/10 bg-[#12121a]">
          {preview ? (
            <Image src={preview} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              <User size={48} />
            </div>
          )}

          {/* Overlay Input File */}
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100">
            <Camera className="text-white" size={24} />
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">Klik gambar untuk mengganti</p>
      </div>

      {/* UPDATE NAMA */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Nama Lengkap / Nama Toko
        </label>
        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            name="fullName"
            required
            defaultValue={profile.full_name || ""}
            placeholder="Contoh: Studio Kreatif"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* UPDATE EMAIL (Read Only) */}
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Email (Tidak bisa diubah)
        </label>
        <input
          disabled
          value={profile.email || "user@example.com"} // Email biasanya ada di auth.users, bukan public.profiles, tapi kita skip dulu
          className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-black/20 py-3 px-4 text-gray-500"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
