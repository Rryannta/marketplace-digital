import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  // 1. Ambil User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Ambil Data Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan Profil</h1>
        <p className="text-sm text-gray-400">
          Atur bagaimana orang lain melihat Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12121a] p-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
