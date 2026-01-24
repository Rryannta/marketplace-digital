import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. TAMBAHAN UTAMA: Naikkan Limit Upload
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Atur jadi 10MB (atau lebih jika perlu)
    },
  },
  images: {
    remotePatterns: [
      // 1. Izin untuk Gambar Produk (Supabase) - JANGAN DIHAPUS
      {
        protocol: "https",
        hostname: "qrrytmattabglknnbqkk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // 2. Izin untuk Avatar Default (UI Avatars) - TAMBAHAN BARU
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/api/**",
      },
      // 3. Izin untuk Avatar Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
