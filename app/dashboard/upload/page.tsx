import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UploadProductForm from "@/components/UploadProductForm"; // <--- Import ini

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <h1 className="mb-8 text-2xl font-bold text-white">Upload Produk Baru</h1>
      <div className="rounded-3xl border border-white/10 bg-[#12121a] p-8 shadow-2xl">
        {/* Panggil Komponen Form Disini */}
        <UploadProductForm />
      </div>
    </div>
  );
}
