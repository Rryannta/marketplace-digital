import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import ProductList from "@/components/ProductList"; // <--- Import Component Baru

export default async function MyProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Produk Saya</h1>
          <p className="text-gray-400 mt-2">
            Kelola aset digital yang kamu jual.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500 hover:scale-105"
        >
          <Plus size={18} />
          Tambah Produk
        </Link>
      </div>

      {/* LOGIKA GRID SEKARANG DITANGANI COMPONENT INI */}
      {products && products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        /* TAMPILAN KOSONG */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
          <div className="rounded-full bg-white/5 p-4 mb-4">
            <Package className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Belum ada produk</h3>
          <p className="text-gray-400 mt-2 max-w-sm mx-auto">
            Kamu belum mengupload apapun.
          </p>
          <Link
            href="/dashboard/upload"
            className="mt-6 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold"
          >
            Upload Produk Pertama <Plus size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
