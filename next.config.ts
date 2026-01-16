import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
