import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Kita matikan caching karena ini request real-time
export const dynamic = "force-dynamic";

const midtransClient = require("midtrans-client");

export async function POST(request: Request) {
  try {
    // 1. Ambil data notifikasi dari Midtrans
    // Data ini dikirim oleh Midtrans berupa JSON
    const notificationJson = await request.json();

    // 2. Setup Midtrans Core API untuk validasi
    let apiClient = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // 3. Cek Status Transaksi dari Notifikasi
    // Fungsi ini akan memverifikasi signature key secara otomatis (Keamanan)
    let statusResponse =
      await apiClient.transaction.notification(notificationJson);

    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    console.log(
      `🔔 Webhook diterima: Order ${orderId} | Status: ${transactionStatus}`,
    );

    // 4. Tentukan Status Akhir untuk Database Kita
    // Midtrans punya banyak status (settlement, capture, deny, cancel, expire, pending)
    let dbStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        dbStatus = "pending"; // Indikasi penipuan, tahan dulu
      } else if (fraudStatus == "accept") {
        dbStatus = "success"; // Aman
      }
    } else if (transactionStatus == "settlement") {
      dbStatus = "success"; // LUNAS (Paling umum)
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      dbStatus = "failed"; // Gagal
    } else if (transactionStatus == "pending") {
      dbStatus = "pending";
    }

    // 5. Update Database Supabase
    const supabase = await createClient();

    // A. Update Status Transaksi
    const { error } = await supabase
      .from("transactions")
      .update({ status: dbStatus })
      .eq("id", orderId);

    if (error) {
      console.error("❌ Gagal update status DB:", error);
      return NextResponse.json({ message: "Database Error" }, { status: 500 });
    }

    // B. (OPSIONAL) Update Sales Count Produk jika SUCCESS
    // Ini untuk fitur "Trending" yang baru kita bahas tadi
    if (dbStatus === "success") {
      const { data: tx } = await supabase
        .from("transactions")
        .select("product_id")
        .eq("id", orderId)
        .single();

      if (tx) {
        // Ambil sales count lama
        const { data: prod } = await supabase
          .from("products")
          .select("sales_count")
          .eq("id", tx.product_id)
          .single();

        // Tambah +1
        await supabase
          .from("products")
          .update({ sales_count: (prod?.sales_count || 0) + 1 })
          .eq("id", tx.product_id);
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json(
      { message: "Error", error: err.message },
      { status: 500 },
    );
  }
}
