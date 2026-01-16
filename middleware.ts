import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Fungsi updateSession ini (nanti kita buat di bawah) akan mengurus refresh token
  return await updateSession(request);
}

export const config = {
  // Middleware ini akan jalan di semua halaman KECUALI file statis (gambar, font, icon)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
