# Data Modeling v5

## Entitas utama

### regions
Master 10 kabupaten/kota NTB.

### hotels
`regionId` mengarah ke `regions.id`; data kecamatan dan desa/kelurahan tetap tersimpan pada record hotel.

### contacts
Owner dan PIC hotel.

### roomTypes
Master tipe kamar.

### prices
- id
- hotelId -> hotels.id
- roomTypeId -> roomTypes.id
- weekday: harga dasar
- weekend: harga dasar
- corporate: harga dasar
- ota: harga dasar
- effectiveDate

### pricingRules
- developerFee = 100000
- closingFee = 150000
- applicationPercent = 15.5

Harga final tidak perlu disimpan terpisah. Nilainya dihitung saat aplikasi menampilkan data:

`final = base + developerFee + closingFee + round(base × applicationPercent / 100)`

Dengan model ini, harga dasar tetap dapat diaudit dan aturan komponen harga dapat diubah kemudian tanpa mengubah semua record harga.

## Ringkasan tipe kamar
Persentase dihitung dari jumlah rate per tipe kamar. Nilai ditampilkan sebagai bilangan bulat. Metode largest remainder digunakan agar hasil pembulatan tetap berjumlah 100% ketika total rate lebih dari 0.
