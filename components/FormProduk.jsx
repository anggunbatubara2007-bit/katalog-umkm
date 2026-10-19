import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Mendukung input teks dan upload file gambar langsung.
export default function FormProduk({ produk = {}, labelTombol, action }) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />

      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />

      {/* Upload file foto baru */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Foto produk</label>
        {produk.foto_url && (
          <div className="flex items-center gap-3 rounded-lg border border-garis bg-permukaan p-2.5">
            <img
              src={produk.foto_url}
              alt={produk.nama || "Preview foto"}
              className="h-14 w-14 rounded-md border border-garis bg-latar object-cover"
            />
            <div className="flex flex-col text-xs text-teks-lembut">
              <span className="font-semibold text-teks">Foto saat ini</span>
              <span className="max-w-xs truncate">{produk.foto_url}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-teks-lembut">
          <span className="font-medium text-teks">Upload gambar baru (opsional):</span>
          <input
            type="file"
            name="foto_file"
            accept="image/*"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-utama file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-utama-gelap"
          />
        </div>

        <Input
          label="Atau link / path foto"
          name="foto_url"
          placeholder="/produk/nama-file.webp atau https://..."
          defaultValue={produk.foto_url}
        />
      </div>

      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} />

      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
