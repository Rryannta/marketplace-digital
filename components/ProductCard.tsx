import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }: { product: any }) {
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // 1. GANTI Link PEMBUNGKUS MENJADI div
  return (
    <div className="group relative block overflow-hidden rounded-2xl bg-[#12121a] border border-white/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* 2. LINK KE PRODUK (Bungkus Gambar) */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative cursor-pointer">
          <Image
            src={product.image_url || "/placeholder.png"}
            alt={product.title || "Gambar Produk"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 rounded-lg bg-black/70 backdrop-blur px-2 py-1 text-xs font-bold text-white border border-white/10">
            {product.price === 0 ? "FREE" : formatRupiah(product.price)}
          </div>

          <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] font-bold text-white border border-white/10">
            {product.category}
          </div>
        </div>
      </Link>

      <div className="p-4">
        {/* 3. LINK KE PRODUK (Bungkus Judul) */}
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer">
            {product.title}
          </h3>
        </Link>

        {/* 4. AREA SELLER (Terpisah) */}
        <div className="mt-2 flex items-center gap-2">
          {/* Avatar (Opsional: Bisa diklik juga ke profil) */}
          <div className="h-5 w-5 overflow-hidden rounded-full border border-white/10 relative">
            <Image
              src={
                product.profiles?.avatar_url ||
                `https://ui-avatars.com/api/?name=${
                  product.profiles?.full_name || "User"
                }`
              }
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>

          {/* LINK KE PROFIL SELLER */}
          <Link
            href={`/seller/${product.user_id}`}
            className="text-xs text-gray-400 hover:text-cyan-400 hover:underline transition-colors z-10"
          >
            {product.profiles?.full_name || "Anonim"}
          </Link>
        </div>
      </div>
    </div>
  );
}
