"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white hover:pl-2"
    >
      <ArrowLeft size={18} />
      Kembali
    </button>
  );
}
