"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Memeriksa apakah pengguna di sesi server saat ini adalah admin yang sudah login.
 * Wajib dipanggil oleh setiap Server Action yang mengubah data.
 */
export async function periksaAdmin(supabaseClient) {
  const supabase = supabaseClient || (await createAdminClient());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: admin belum login.");
  }

  return user;
}

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 */
export async function login(prevState, formData) {
  if (prevState instanceof FormData) {
    formData = prevState;
  }

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Silakan coba lagi." };
  }

  redirect("/admin");
}

/**
 * Server Action untuk logout admin (mengakhiri sesi).
 */
export async function logout() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 */
export async function gantiPassword(prevState, formData) {
  if (prevState instanceof FormData) {
    formData = prevState;
  }

  const supabase = await createAdminClient();

  try {
    await periksaAdmin(supabase);
  } catch (err) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const passwordBaru = formData.get("password_baru")?.toString() || "";
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi tidak sama." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
}

/**
 * Helper untuk memproses file upload foto ke public/produk
 */
async function prosesUploadFoto(fotoFile, existingFotoUrl) {
  let fotoUrl = existingFotoUrl || "";

  if (fotoFile && typeof fotoFile === "object" && fotoFile.size > 0 && fotoFile.name) {
    const bytes = await fotoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(fotoFile.name) || ".webp";
    const sanitizedBase = path.basename(fotoFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeName = `${Date.now()}-${sanitizedBase}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "produk");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, safeName), buffer);
    fotoUrl = `/produk/${safeName}`;
  }

  return fotoUrl;
}

/**
 * Server Action untuk menambah produk baru ke database.
 */
export async function tambahProduk(formData) {
  const supabase = await createAdminClient();
  await periksaAdmin(supabase);

  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
  const kategori = formData.get("kategori")?.toString().trim() || "";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || "";
  const fotoFile = formData.get("foto_file");
  const inputFotoUrl = formData.get("foto_url")?.toString().trim() || "";

  const foto_url = await prosesUploadFoto(fotoFile, inputFotoUrl);

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    deskripsi,
    foto_url,
  });

  if (error) {
    throw new Error(`Gagal menambah produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Server Action untuk mengubah produk di database.
 */
export async function ubahProduk(formData) {
  const supabase = await createAdminClient();
  await periksaAdmin(supabase);

  const id = formData.get("id");
  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
  const kategori = formData.get("kategori")?.toString().trim() || "";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || "";
  const fotoFile = formData.get("foto_file");
  const inputFotoUrl = formData.get("foto_url")?.toString().trim() || "";

  const foto_url = await prosesUploadFoto(fotoFile, inputFotoUrl);

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

/**
 * Server Action untuk menghapus produk dari database.
 */
export async function hapusProduk(formData) {
  const supabase = await createAdminClient();
  await periksaAdmin(supabase);

  const id = formData.get("id");
  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
