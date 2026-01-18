"use client";

import { signOut } from "@/app/login/actions";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function SignOutButton() {
  const handleLogout = async () => {
    // Tampilkan notifikasi "Bye bye"
    toast.success("Berhasil keluar. Sampai jumpa!");

    // Panggil Server Action
    await signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition"
    >
      <LogOut size={20} />
      Keluar
    </button>
  );
}
