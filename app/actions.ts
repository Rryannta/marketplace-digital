"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getDownloadUrl(productId: string) {
  const supabase = await createClient();

  // 1. Cek User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  // 2. Ambil Data Produk
  const { data: product, error } = await supabase
    .from("products")
    .select("id, file_url, price, title")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return { error: "Produk tidak ditemukan" };
  }

  // 3. LOGIKA PENCATATAN
  // Cek apakah user sudah pernah beli
  const { data: existingTx } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "success")
    .single();

  // Jika belum punya & harganya 0, catat transaksi
  if (!existingTx && product.price === 0) {
    // === PERBAIKAN DI SINI ===
    const { error: txError } = await supabase.from("transactions").insert({
      buyer_id: user.id,
      product_id: product.id,
      amount: 0, // <--- DULU "price", SEKARANG "amount" (Sesuai Errormu)
      status: "success",
    });
    // =========================

    if (txError) {
      console.error("Gagal mencatat transaksi:", txError);
      return { error: `Gagal database: ${txError.message}` };
    }
  } else if (!existingTx && product.price > 0) {
    return { error: "Produk ini berbayar. Harap selesaikan pembayaran." };
  }

  // 4. Proses Link Download
  let filePath = product.file_url;
  if (filePath.includes("product-files/")) {
    filePath = filePath.split("product-files/")[1];
  }

  const { data, error: storageError } = await supabase.storage
    .from("product-files")
    .createSignedUrl(filePath, 60, {
      download: true,
    });

  if (storageError) {
    return { error: "Gagal mengambil file." };
  }

  return { url: data.signedUrl };
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const productId = formData.get("id") as string;

  // 1. Cek User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Validasi Pemilik
  const { data: product } = await supabase
    .from("products")
    .select("user_id")
    .eq("id", productId)
    .single();

  if (!product || product.user_id !== user.id) {
    return { error: "Anda tidak berhak menghapus produk ini." };
  }

  // 3. LAKUKAN SOFT DELETE (ARSIP)
  // Kita TIDAK menghapus gambar/file dari storage,
  // supaya pembeli lama masih bisa download.

  const { error } = await supabase
    .from("products")
    .update({ is_archived: true }) // <--- Cuma update status
    .eq("id", productId);

  if (error) return { error: error.message };

  // 4. Refresh Halaman
  revalidatePath("/dashboard/products");
  revalidatePath("/");

  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const productId = formData.get("id") as string;

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. LOGIKA UPDATE DI DALAM TRY/CATCH
  try {
    const { data: oldProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (!oldProduct || oldProduct.user_id !== user.id) {
      return { error: "Anda tidak berhak mengedit produk ini." };
    }

    const updates: any = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      price: Number(formData.get("price")),
    };

    // --- LOGIKA UPLOAD GAMBAR BARU ---
    const newImage = formData.get("image") as File;
    if (newImage && newImage.size > 0) {
      const fileName = `${Date.now()}-${newImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, newImage);

      if (uploadError) throw new Error("Gagal upload gambar");

      // Hapus file lama
      if (oldProduct.image_url) {
        const oldPath = oldProduct.image_url.split("product-images/")[1];
        if (oldPath)
          await supabase.storage.from("product-images").remove([oldPath]);
      }

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      updates.image_url = publicUrl.publicUrl;
    }

    // --- LOGIKA UPLOAD FILE ZIP BARU ---
    const newFile = formData.get("file") as File;
    if (newFile && newFile.size > 0) {
      const fileName = `${Date.now()}-${newFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(fileName, newFile);

      if (uploadError) throw new Error("Gagal upload file");

      // Hapus file lama
      if (oldProduct.file_url) {
        const oldPath = oldProduct.file_url.split("product-files/")[1];
        if (oldPath)
          await supabase.storage.from("product-files").remove([oldPath]);
      }

      updates.file_url = fileName;
    }

    // --- UPDATE DATABASE ---
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId);

    if (error) throw new Error(error.message);
  } catch (error: any) {
    // Jika ada error, kita return object error
    return { error: error.message };
  }

  // 3. REVALIDATE (TAPI JANGAN REDIRECT DI SINI)
  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/");

  // redirect("/dashboard/products"); <--- SUDAH DIHAPUS

  return { success: true }; // <--- GANTINYA INI
}

export async function fetchProducts(
  page: number,
  searchQuery: string,
  category: string,
  filter: string,
) {
  const supabase = await createClient();

  const limit = 8;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      profiles ( full_name, avatar_url )
    `,
    )
    .range(from, to);

  query = query.eq("is_archived", false);

  // 1. Filter Search
  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
    );
  }

  // 2. Filter Kategori
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // 3. FILTER TAB (SAMAKAN DENGAN getProducts)
  switch (filter) {
    case "trending":
      // Urutkan berdasarkan penjualan terbanyak
      query = query.order("sales_count", { ascending: false });
      break;

    case "sale":
      // Hanya ambil yang punya harga coret
      query = query.not("original_price", "is", null);
      query = query.order("price", { ascending: true });
      break;

    case "terbaru":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data } = await query;
  return data || [];
}

export async function deleteProducts(ids: string[]) {
  const supabase = await createClient();

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Validasi: Pastikan SEMUA produk milik user ini
  // Kita cek dulu apakah user berhak menghapus ID-ID tersebut
  const { data: products } = await supabase
    .from("products")
    .select("id, user_id")
    .in("id", ids);

  if (!products || products.length === 0)
    return { error: "Produk tidak ditemukan" };

  // Filter hanya produk milik user yang sedang login
  const validProducts = products.filter((p) => p.user_id === user.id);
  const validIds = validProducts.map((p) => p.id);

  if (validIds.length === 0)
    return { error: "Tidak ada produk yang bisa dihapus" };

  // 3. LAKUKAN SOFT DELETE (ARSIP)
  // CATATAN PENTING:
  // - Kita HAPUS logika penghapusan Storage (remove image/file)
  //   agar pembeli lama tetap bisa akses file-nya.
  // - Kita GANTI .delete() menjadi .update()

  const { error } = await supabase
    .from("products")
    .update({ is_archived: true }) // <--- Ubah Status jadi Arsip
    .in("id", validIds); // <--- Update semua ID sekaligus

  if (error) return { error: error.message };

  // 4. Refresh
  revalidatePath("/dashboard/products");
  revalidatePath("/");

  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const fullName = formData.get("fullName") as string;
  const avatarFile = formData.get("avatar") as File;

  const updates: any = {
    full_name: fullName,
    updated_at: new Date().toISOString(),
  };

  // 2. Logika Upload Avatar (Mirip upload produk)
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `avatar-${user.id}-${Date.now()}`;

    // Upload ke bucket "avatars" (Pastikan bucket ini ada, atau pakai product-images sementara)
    // SAYA SARANKAN PAKAI "product-images" SAJA BIAR GAMPANG (Gak perlu setting bucket baru)
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, avatarFile, {
        upsert: true, // <--- TAMBAHKAN INI (Agar file bisa ditimpa kalau namanya sama)
      });

    if (uploadError) {
      console.error("Error Upload Detail:", uploadError); // <--- CEK TERMINAL VSCODE
      return { error: `Gagal upload: ${uploadError.message}` }; // <--- TAMPILKAN PESAN ASLI
    }

    const { data: publicUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    updates.avatar_url = publicUrl.publicUrl;
  }

  // 3. Update Database
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  // 4. Refresh Halaman
  revalidatePath("/dashboard/settings");
  revalidatePath("/"); // Biar nama di navbar/produk berubah

  return { success: true };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  // 1. Cek User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Anda harus login untuk mengupload produk." };

  // 2. Ambil Data dari Form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const imageFile = formData.get("image") as File; // Wajib
  const productFile = formData.get("file") as File; // Wajib

  // 3. Validasi Dasar
  if (!imageFile || imageFile.size === 0)
    return { error: "Cover image wajib diisi." };
  if (!productFile || productFile.size === 0)
    return { error: "File produk wajib diisi." };

  // 4. Upload Gambar Cover (Bucket Public)
  const imageName = `${Date.now()}-${imageFile.name}`;
  const { error: imageError } = await supabase.storage
    .from("product-images")
    .upload(imageName, imageFile);

  if (imageError)
    return { error: `Gagal upload gambar: ${imageError.message}` };

  const { data: imageData } = supabase.storage
    .from("product-images")
    .getPublicUrl(imageName);

  // 5. Upload File Produk (Bucket Private)
  const fileName = `${Date.now()}-${productFile.name}`;
  const { error: fileError } = await supabase.storage
    .from("product-files")
    .upload(fileName, productFile);

  if (fileError) return { error: `Gagal upload file: ${fileError.message}` };

  // 6. Simpan ke Database
  const { error: dbError } = await supabase.from("products").insert({
    user_id: user.id,
    title: title,
    description: description,
    category: category,
    price: price,
    image_url: imageData.publicUrl,
    file_url: fileName, // Simpan path saja
  });

  if (dbError) return { error: dbError.message };

  // 7. Refresh Data
  revalidatePath("/");
  revalidatePath("/dashboard/products");

  return { success: true };
}

export async function getLibraryItems() {
  const supabase = await createClient();

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. Ambil Transaksi Sukses + Data Produknya
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      created_at,
      products (
        id,
        title,
        image_url,
        category,
        file_url,
        price,
        profiles ( full_name, avatar_url )
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  // === PERBAIKAN DI SINI ===
  const libraryItems =
    transactions
      // 1. Filter: Hanya ambil transaksi yang data 'products'-nya TIDAK null
      ?.filter((tx) => tx.products !== null)
      // 2. Baru di-map seperti biasa
      .map((tx) => ({
        ...tx.products,
        purchased_at: tx.created_at,
      })) || [];

  return libraryItems;
}

// app/actions.ts -> getSellerStats

export async function getSellerStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Ambil semua ID Produk milik user
  const { data: myProducts } = await supabase
    .from("products")
    .select("id")
    .eq("user_id", user.id);

  // Jika tidak punya produk, langsung return 0
  const productIds = myProducts?.map((p) => p.id) || [];
  if (productIds.length === 0) {
    return {
      totalRevenue: 0,
      totalSales: 0,
      totalProducts: 0,
      recentSales: [],
    };
  }

  // 2. Ambil Transaksi (VERSI AMAN: TANPA JOIN PROFILES DULU)
  // Kita cek apakah transaksinya ada dulu, tanpa peduli profil pembelinya siapa.
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      `
      amount,
      created_at,
      product_id
    `,
    )
    .in("product_id", productIds)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error Fetch Stats:", error);
    return null;
  }

  // 3. Hitung Manual
  const totalSales = transactions?.length || 0;
  const totalRevenue =
    transactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // 4. Ambil Nama Produk (Manual Fetch biar aman)
  // Kita ambil 5 transaksi terakhir untuk ditampilkan
  const recentSalesRaw = transactions?.slice(0, 5) || [];

  // Kita format datanya biar tidak error di frontend
  const recentSales = recentSalesRaw.map((tx) => ({
    amount: tx.amount,
    created_at: tx.created_at,
    products: { title: "Produk Terjual" }, // Placeholder dulu
    profiles: { full_name: "Pembeli", avatar_url: "" }, // Placeholder dulu
  }));

  return {
    totalRevenue,
    totalSales,
    totalProducts: productIds.length,
    recentSales,
  };
}

const midtransClient = require("midtrans-client");
export async function createTransactionToken(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Wajib login untuk membeli." };

  // 1. Ambil Detail Produk
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Produk tidak ditemukan." };

  // 2. Setup Midtrans
  const snap = new midtransClient.Snap({
    isProduction: false, // Ubah ke true nanti kalau sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });

  // 3. Buat Order ID Unik (Gabungan ID User + Waktu)
  // Contoh: ORDER-user123-17239999
  const orderId = `ORDER-${user.id.slice(0, 5)}-${Date.now()}`;

  // 4. Siapkan Parameter Transaksi
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: product.price,
    },
    item_details: [
      {
        id: product.id,
        price: product.price,
        quantity: 1,
        name: product.title.substring(0, 50), // Midtrans membatasi panjang nama
      },
    ],
    customer_details: {
      first_name: user.user_metadata?.full_name || "Customer",
      email: user.email,
    },
  };

  // 5. Minta Token ke Midtrans
  try {
    const transaction = await snap.createTransaction(parameter);

    // 6. CATAT TRANSAKSI "PENDING" KE DATABASE KITA
    await supabase.from("transactions").insert({
      id: orderId,

      // PERBAIKAN: Ganti 'buyer_id' jadi 'user_id' sesuai nama kolom database
      user_id: user.id,

      product_id: product.id,
      amount: product.price,
      status: "pending",
    });

    return { token: transaction.token };
  } catch (err: any) {
    console.error("Midtrans Error:", err);
    return { error: "Gagal memproses pembayaran." };
  }
}

export async function verifyTransaction(orderId: string) {
  const supabase = await createClient();

  // 1. Setup Core API
  // Kita pakai CoreApi untuk cek status (bukan Snap)
  let coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  try {
    console.log(`🔍 Mengecek status Order ID: ${orderId} via SDK...`);

    // 2. Minta Status ke Midtrans (Pakai fungsi bawaan library)
    const data = await coreApi.transaction.status(orderId);

    // 3. Lihat Hasilnya di Terminal
    console.log("📩 Status Transaksi:", data.transaction_status);

    // 4. Cek Logika Lunas
    if (
      data.transaction_status == "settlement" ||
      data.transaction_status == "capture"
    ) {
      console.log("✅ Pembayaran LUNAS. Update Database...");

      const { error } = await supabase
        .from("transactions")
        .update({ status: "success" })
        .eq("id", orderId);

      if (error) {
        console.error("❌ Gagal update DB:", error);
      } else {
        // Refresh halaman user
        revalidatePath("/products/[id]");
        revalidatePath("/library");
      }

      const { data: txData } = await supabase
        .from("transactions")
        .select("product_id")
        .eq("id", orderId)
        .single();

      if (txData) {
        // 2. Kita pakai RPC (Remote Procedure Call) biar aman,
        // tapi cara manual (Ambil -> Tambah -> Simpan) juga oke untuk awal.

        // Ambil jumlah sales sekarang
        const { data: prod } = await supabase
          .from("products")
          .select("sales_count")
          .eq("id", txData.product_id)
          .single();

        // Update +1
        if (prod) {
          await supabase
            .from("products")
            .update({ sales_count: (prod.sales_count || 0) + 1 })
            .eq("id", txData.product_id);
        }
      }

      return { status: "success" };
    }

    return { status: "pending" };
  } catch (error: any) {
    // Tangkap error detail dari Midtrans
    console.error("❌ Error SDK Midtrans:", error.message);
    return { error: "Gagal verifikasi pembayaran" };
  }
}

export async function getSearchSuggestions(query: string) {
  const supabase = await createClient();

  if (!query || query.length < 2) return []; // Jangan cari kalau cuma 1 huruf

  console.log(`🔍 Server mencari: "${query}"`); // <--- LOG 1

  // Cari produk yang judulnya mengandung kata kunci
  const { data, error } = await supabase
    .from("products")
    .select("id, title, category")
    .ilike("title", `%${query}%`) // Case insensitive search
    .limit(5); // Ambil 5 saja biar mirip Youtube suggestions

  if (error) {
    console.error("❌ Error Database:", error); // <--- LOG 2 (Jika Error)
    return [];
  }

  console.log("✅ Hasil Ditemukan:", data);

  return data || [];
}

export async function saveSearchHistory(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !query.trim()) return;

  const cleanQuery = query.trim().toLowerCase();

  // Upsert: Kalau belum ada -> Insert. Kalau sudah ada -> Update created_at
  await supabase.from("search_history").upsert(
    {
      user_id: user.id,
      query: cleanQuery,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id, query" }, // Kunci unik yang kita buat di SQL
  );
}

// 2. Ambil History Terakhir User
export async function getSearchHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("search_history")
    .select("query")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) // Yang baru dicari paling atas
    .limit(5); // Ambil 5 terakhir saja

  return data?.map((d) => d.query) || [];
}

export async function getProducts(
  search?: string,
  category?: string,
  filter?: string,
) {
  const supabase = await createClient();

  // 1. Query Dasar
  let query = supabase.from("products").select(`
      *,
      profiles ( full_name, avatar_url )
    `);

  query = query.eq("is_archived", false);

  // 2. Filter Search
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  // 3. Filter Kategori
  if (category) {
    query = query.eq("category", category);
  }

  // 4. FILTER TAB
  switch (filter) {
    case "trending":
      // Urutkan berdasarkan kolom sales_count (Terbanyak ke Sedikit)
      query = query.order("sales_count", { ascending: false });
      break; // Samakan dengan activeKey di page.tsx
    case "terbaru":
      query = query.order("created_at", { ascending: false });
      break;

    case "sale":
      // Filter: Hanya ambil yang original_price-nya TIDAK null (ada isinya)
      query = query.not("original_price", "is", null);

      // Opsional: Urutkan dari diskon terbesar (butuh logika complex)
      // Untuk sekarang, urutkan termurah saja biar tetap relevan
      query = query.order("price", { ascending: true });
      break;

    default:
      // Default: Urutkan Terbaru
      query = query.order("created_at", { ascending: false });
      break;
  }

  // 5. BATASI HANYA 8 PRODUK (PENTING AGAR HALAMAN TIDAK BERAT)
  query = query.range(0, 7);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}
