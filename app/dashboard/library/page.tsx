import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Download, PackageOpen } from "lucide-react";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      created_at,
      products (
        id,
        title,
        image_url,
        category,
        file_url,
        price
      )
    `
    )
    .eq("buyer_id", user?.id) // <--- GANTI JADI buyer_id
    .eq("status", "success")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Library Saya</h1>
        <p className="text-sm text-gray-400">
          {transactions?.length || 0} Item dimiliki
        </p>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {transactions.map((tx: any) => {
            const product = tx.products;
            if (!product) return null;

            return (
              <div
                key={tx.created_at}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12121a] transition hover:border-white/20"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
                  <Image
                    src={product.image_url || "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-full bg-white/20 backdrop-blur px-4 py-2 text-xs font-bold text-white hover:bg-white/30"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="line-clamp-1 text-base font-bold text-white mt-1">
                      {product.title}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 transition"
                    >
                      <Download size={14} /> Download
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
          <div className="mb-4 rounded-full bg-white/5 p-4">
            <PackageOpen size={40} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white">Library Kosong</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm">
            Kamu belum membeli atau mendownload produk apapun.
          </p>
          <Link
            href="/"
            className="rounded-full bg-cyan-600 px-6 py-2 text-sm font-bold text-white hover:bg-cyan-500"
          >
            Jelajahi Produk
          </Link>
        </div>
      )}
    </div>
  );
}
