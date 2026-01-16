import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SeachInput";
import {
  ShoppingBag,
  Cpu,
  Palette,
  Gamepad2,
  BookOpen,
  Music,
  Box,
  User,
  LogIn,
  Home,
  Flame,
  Sparkles,
  Tag,
} from "lucide-react"; // Note: LayoutGrid dihapus karena tidak dipakai lagi

// MENU UTAMA (Discover)
const DISCOVER_MENU = [
  { name: "Beranda", icon: Home, href: "/", activeKey: null },
  {
    name: "Sedang Tren",
    icon: Flame,
    href: "/?filter=trending",
    activeKey: "trending",
  },
  { name: "Terbaru", icon: Sparkles, href: "/?filter=new", activeKey: "new" },
  {
    name: "Diskon / Promo",
    icon: Tag,
    href: "/?filter=sale",
    activeKey: "sale",
  },
];

// MENU KATEGORI (Browse) - "Semua Produk" SUDAH DIHAPUS
const CATEGORIES = [
  // { name: "Semua Produk"... } <-- HAPUS
  { name: "Template Web", icon: Cpu, key: "Template Web" },
  { name: "Desain & UI", icon: Palette, key: "Desain & UI" },
  { name: "Game Assets", icon: Gamepad2, key: "Game Assets" },
  { name: "E-Books", icon: BookOpen, key: "E-Books" },
  { name: "Audio", icon: Music, key: "Audio" },
  { name: "3D Models", icon: Box, key: "3D Models" },
];

interface HomepageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Homepage({ searchParams }: HomepageProps) {
  const supabase = await createClient();

  const params = await searchParams;
  const querySearch = (params.search as string) || "";
  const queryCategory = (params.category as string) || "";
  const queryFilter = (params.filter as string) || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("products").select(`
      *,
      profiles ( full_name, avatar_url )
    `);

  if (querySearch) {
    query = query.ilike("title", `%${querySearch}%`);
  }

  if (queryCategory && queryCategory !== "all") {
    query = query.eq("category", queryCategory);
  }

  if (queryFilter === "sale") {
    query = query.lt("price", 50000);
  }

  query = query.order("created_at", { ascending: false });

  const { data: products } = await query;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white">
      {/* === NAVBAR ATAS === */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#05050a]/80 backdrop-blur-xl px-6 py-4">
        <div className="flex w-full items-center justify-between gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 shadow-lg shadow-cyan-500/20">
              <ShoppingBag size={18} className="text-white" />
            </div>
            Marketplace<span className="text-cyan-400">Kita</span>
          </Link>

          <div className="hidden flex-1 md:block max-w-2xl">
            <SearchInput />
          </div>

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              <User size={16} />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500"
            >
              <LogIn size={16} />
              Masuk
            </Link>
          )}
        </div>
      </nav>

      {/* === LAYOUT UTAMA === */}
      <div className="flex w-full pt-6">
        {/* SIDEBAR KIRI */}
        <aside className="hidden w-64 flex-col gap-8 px-6 md:flex sticky top-24 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide border-r border-white/5">
          {/* GROUP 1: DISCOVER */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Discover
            </p>
            {DISCOVER_MENU.map((item) => {
              const isActive = item.activeKey
                ? queryFilter === item.activeKey
                : !queryFilter && !queryCategory;

              return (
                <Link
                  href={item.href}
                  key={item.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 font-bold shadow-[inset_3px_0_0_0_#22d3ee]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={
                      item.name === "Sedang Tren"
                        ? "text-orange-500"
                        : item.name === "Diskon / Promo"
                        ? "text-red-400"
                        : ""
                    }
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* GROUP 2: CATEGORIES */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Categories
            </p>
            {CATEGORIES.map((cat) => {
              const isActive = queryCategory === cat.key;

              return (
                <Link
                  href={`/?category=${cat.key}`}
                  key={cat.name}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-bold shadow-[inset_3px_0_0_0_#ffffff]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <cat.icon
                    size={20}
                    className={isActive ? "text-cyan-400" : ""}
                  />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* KONTEN KANAN */}
        <main className="flex-1 px-8 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {querySearch ? (
                <>
                  Hasil pencarian:{" "}
                  <span className="text-cyan-400">"{querySearch}"</span>
                </>
              ) : queryCategory ? (
                <>
                  Kategori:{" "}
                  <span className="text-cyan-400">{queryCategory}</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} className="text-cyan-400" /> Baru Diupload
                </>
              )}
            </h2>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="group relative block overflow-hidden rounded-2xl bg-[#12121a] border border-white/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative">
                    <Image
                      src={product.image_url || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 rounded-lg bg-black/70 backdrop-blur px-2 py-1 text-xs font-bold text-white border border-white/10">
                      {product.price === 0
                        ? "FREE"
                        : formatRupiah(product.price)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {product.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-5 w-5 overflow-hidden rounded-full border border-white/10">
                        <Image
                          src={
                            product.profiles?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${
                              product.profiles?.full_name || "User"
                            }`
                          }
                          alt="Avatar"
                          width={20}
                          height={20}
                        />
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {product.profiles?.full_name || "Unknown Creator"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <div className="rounded-full bg-white/10 p-4 mb-4">
                <ShoppingBag className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Oops, tidak ditemukan!
              </h3>
              <p className="text-gray-400 mb-4 max-w-sm">
                Produk dengan kata kunci atau kategori tersebut belum tersedia.
              </p>
              <Link
                href="/"
                className="px-6 py-2 rounded-full bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-500 transition"
              >
                Reset Filter
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
