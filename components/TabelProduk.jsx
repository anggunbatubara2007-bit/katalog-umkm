"use client";

import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk }) {
  if (!daftarProduk || daftarProduk.length === 0) {
    return (
      <div className="rounded-2xl border border-garis p-8 text-center text-sm text-teks-lembut">
        Belum ada produk. Klik "Tambah produk" untuk menambahkan produk baru.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={produk.foto_url}
                    alt=""
                    className="h-10 w-10 rounded-md bg-permukaan object-cover"
                  />
                  <span className="font-semibold">{produk.nama}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <form
                    action={hapusProduk}
                    onSubmit={(e) => {
                      if (!confirm(`Hapus produk "${produk.nama}"?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={produk.id} />
                    <Tombol type="submit" varian="bahaya">
                      Hapus
                    </Tombol>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
