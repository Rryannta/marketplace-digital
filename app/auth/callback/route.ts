import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Ambil URL dan Code dari parameter
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/"; // Default redirect ke dashboard

  if (code) {
    // 2. Tukar Code menjadi Session
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Jika sukses, lempar user ke halaman tujuan (Dashboard)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 4. Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
