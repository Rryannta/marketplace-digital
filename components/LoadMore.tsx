"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // Library Mata-mata
import { Loader2 } from "lucide-react";
import { fetchProducts } from "@/app/actions";
import ProductCard from "./ProductCard";

// Tipe Props
type LoadMoreProps = {
  search: string;
  category: string;
  filter: string;
  initialOffset: number; // Mulai dari halaman berapa (misal halaman 2)
};

export default function LoadMore({
  search,
  category,
  filter,
  initialOffset,
}: LoadMoreProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);

  // ref: elemen yang dipantau
  // inView: bernilai TRUE jika elemen terlihat di layar
  const { ref, inView } = useInView();

  const loadMoreProducts = async () => {
    // Panggil Server Action
    const newProducts = await fetchProducts(page, search, category, filter);

    if (newProducts.length > 0) {
      // Gabungkan produk lama + baru
      setProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1); // Siap-siap load halaman berikutnya
    } else {
      // Jika data habis, stop loading
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreProducts();
    }
  }, [inView, hasMore]); // Efek jalan setiap kali elemen 'ref' terlihat

  return (
    <>
      {/* Tampilkan Produk yang baru di-load */}
      {products.map((product) => (
        <ProductCard key={`${product.id}-${page}`} product={product} />
      ))}

      {/* Elemen Pemicu / Loading Spinner */}
      {hasMore && (
        <div
          ref={ref} // <--- Pasang mata-mata di sini
          className="col-span-1 flex justify-center py-8 sm:col-span-2 lg:col-span-3 xl:col-span-4"
        >
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      )}
    </>
  );
}
