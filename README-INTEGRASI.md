
# DATA-HOTEL INVENTORY KAMAR PATCH V1

## Tujuan
Menambahkan modul Inventory Kamar dengan risiko minimal.

## Prinsip Aman
Patch ini TIDAK:
- mengganti app.js lama
- menghapus database lama
- mengubah perhitungan harga
- mengubah kode hotel
- mengubah master wilayah

## Cara Integrasi

1. Upload:
- inventory-module.js
- inventory-style.css

ke repository DATA-HOTEL.

2. Tambahkan script baru di index.html:

<script src="inventory-module.js"></script>

3. Tambahkan field database:

inventoryKamar: []

4. Baru kemudian tambahkan menu hamburger:
Inventory Kamar

## Relasi

Hotel
 |
 Inventory Kamar
 |
 Tipe Kamar

## Tahap berikutnya
Membuat halaman CRUD Inventory Kamar yang mengikuti struktur aplikasi utama.
