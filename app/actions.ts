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
    .eq("buyer_id", user.id)
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

  // 2. Ambil Data Produk Dulu (Untuk dapat nama file gambar/zip yang mau dihapus)
  const { data: product } = await supabase
    .from("products")
    .select("image_url, file_url, user_id")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Produk tidak ditemukan" };

  // Validasi: Pastikan yang menghapus adalah PEMILIK produk
  if (product.user_id !== user.id) {
    return { error: "Anda tidak berhak menghapus produk ini." };
  }

  // 3. Hapus Gambar dari Storage (Jika ada)
  if (product.image_url) {
    const imagePath = product.image_url.split("product-images/")[1];
    if (imagePath)
      await supabase.storage.from("product-images").remove([imagePath]);
  }

  // 4. Hapus File Produk dari Storage (Jika ada)
  if (product.file_url) {
    const filePath = product.file_url.split("product-files/")[1];
    if (filePath)
      await supabase.storage.from("product-files").remove([filePath]);
  }

  // 5. Hapus Data dari Database
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) return { error: error.message };

  // 6. Refresh Halaman Dashboard
  revalidatePath("/dashboard/products");
  revalidatePath("/"); // Refresh home juga biar produk hilang dari etalase

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

  // 3. REVALIDATE & REDIRECT (DI LUAR TRY CATCH)
  // Kode di sini hanya jalan jika TIDAK ada error di atas
  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/");

  redirect("/dashboard/products");
}

export async function fetchProducts(
  page: number,
  searchQuery: string,
  category: string,
  filter: string
) {
  const supabase = await createClient();

  // Hitung Range Data (Pagination)
  // Page 1: 0 - 9
  // Page 2: 10 - 19
  // Page 3: 20 - 29
  const limit = 8; // Kita load 8 produk per scroll
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      profiles ( full_name, avatar_url )
    `
    )
    .range(from, to); // <--- KUNCI PAGINATION ADA DI SINI

  // Terapkan Filter yang sama seperti di Homepage
  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (filter === "sale") {
    query = query.lt("price", 50000);
  }

  // Default Order
  query = query.order("created_at", { ascending: false });

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

  // 2. Ambil Data Produk (Cari file yang harus dihapus)
  // Kita filter pakai "in" (daftar ID)
  const { data: products } = await supabase
    .from("products")
    .select("id, image_url, file_url, user_id")
    .in("id", ids);

  if (!products || products.length === 0)
    return { error: "Produk tidak ditemukan" };

  // 3. Validasi: Pastikan SEMUA produk milik user ini
  const validProducts = products.filter((p) => p.user_id === user.id);
  const validIds = validProducts.map((p) => p.id);

  if (validIds.length === 0)
    return { error: "Tidak ada produk yang bisa dihapus" };

  // 4. Kumpulkan Sampah (File & Gambar)
  const imagePaths: string[] = [];
  const filePaths: string[] = [];

  validProducts.forEach((p) => {
    if (p.image_url) {
      const path = p.image_url.split("product-images/")[1];
      if (path) imagePaths.push(path);
    }
    if (p.file_url) {
      const path = p.file_url.split("product-files/")[1];
      if (path) filePaths.push(path);
    }
  });

  // 5. Buang Sampah ke Storage
  if (imagePaths.length > 0)
    await supabase.storage.from("product-images").remove(imagePaths);
  if (filePaths.length > 0)
    await supabase.storage.from("product-files").remove(filePaths);

  // 6. Hapus Data dari Database
  const { error } = await supabase.from("products").delete().in("id", validIds);

  if (error) return { error: error.message };

  // 7. Refresh
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
