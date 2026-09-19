
/*
 DATA-HOTEL Inventory Kamar Patch V1

 Modul tambahan aman.
 Tidak mengganti fungsi lama:
 - Data Hotel
 - Wilayah
 - Owner/PIC
 - Harga
 - Tipe Kamar

Tambahkan object inventoryKamar pada database:
inventoryKamar: []

Contoh record:
{
 id: "INV001",
 hotelId: "HOTEL001",
 roomTypeId: "DLX",
 unit: 20,
 status: "Aktif"
}
*/

window.InventoryKamarModule = {
  create(data){
    return {
      id: "INV-" + Date.now(),
      hotelId: data.hotelId || "",
      roomTypeId: data.roomTypeId || "",
      unit: Number(data.unit || 0),
      status: data.status || "Aktif"
    };
  },

  totalUnit(list){
    return (list || []).reduce((a,b)=>a + Number(b.unit || 0),0);
  }
};
