"use server";

import { redirect } from "next/navigation";
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

  // Memastikan admin sedang login
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

