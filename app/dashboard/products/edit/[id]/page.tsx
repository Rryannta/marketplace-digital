import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditProductForm from "@/components/EditProductForm";
import BackButton from "@/components/BackButton"; // Kita pakai lagi tombol ini

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params; // Await params (Next.js 15)
  const supabase = await createClient();

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Ambil Data Produk
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  // 3. Validasi
  if (!product) notFound();

  // Keamanan: Pastikan yang buka halaman ini adalah PEMILIK produk
  if (product.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Anda tidak memiliki akses ke produk ini.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <div className="mb-8 flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold text-white">Edit Produk</h1>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#12121a] p-8 shadow-2xl">
        <EditProductForm product={product} />
      </div>
    </div>
  );
}
