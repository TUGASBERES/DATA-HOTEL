# NTB Hospitality Database v5

Dashboard admin database hotel untuk Nusa Tenggara Barat, dirancang sebagai data-only dashboard tanpa foto.

## Perubahan v5
- Harga yang diinput diperlakukan sebagai **harga dasar**.
- Harga final otomatis = harga dasar + Rp100.000 pengembang + Rp150.000 karyawan closing + 15,5% dari harga dasar untuk aplikasi.
- Aturan berlaku untuk Weekday, Weekend, Corporate, dan OTA.
- Tabel harga menampilkan harga final sekaligus harga dasar sebagai referensi.
- Form harga memiliki preview perhitungan sebelum disimpan.
- Ringkasan tipe kamar menggunakan persentase bilangan bulat tanpa desimal; pembulatan didistribusikan agar total tetap 100% ketika ada data.

## Master wilayah NTB
- 10 kabupaten/kota
- 117 kecamatan
- 1.166 desa/kelurahan
- terdiri dari 145 kelurahan + 1.021 desa

## Penyimpanan
Versi ini menggunakan localStorage dengan key `ntb-hospitality-data-v5`. Bila browser masih memiliki data v4, data akan dimigrasikan otomatis ke v5.

Untuk multi-user / sinkron antar perangkat, migrasikan model data ke Supabase/Firebase.
