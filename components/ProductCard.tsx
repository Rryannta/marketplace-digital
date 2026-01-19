import Link from "next/link";
import Image from "next/image";

// Kita terima data produk sebagai props
export default function ProductCard({ product }: { product: any }) {
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-[#12121a] border border-white/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative">
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

        {/* Badge Kategori */}
        <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] font-bold text-white border border-white/10">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-5 w-5 overflow-hidden rounded-full border border-white/10 relative">
            <Image
              src={
                product.profiles?.avatar_url ||
                `https://ui-avatars.com/api/?name=${product.profiles?.full_name || "User"}`
              }
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-xs text-gray-400 truncate">
            {product.profiles?.full_name || "Unknown Creator"}
          </p>
        </div>
      </div>
    </Link>
  );
}
