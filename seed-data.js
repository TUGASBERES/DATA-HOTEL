window.NTB_SEED = {
  version: 5,
  meta: {
    appName: "NTB Hospitality Database",
    scope: "Nusa Tenggara Barat",
    adminReference: "Kepmendagri 300.2.2-2430 Tahun 2025",
    provinceCode: "52"
  },
  pricingRules: {
    developerFee: 100000,
    closingFee: 150000,
    applicationPercent: 15.5
  },
  adminMaster: {
    regencyCount: 10,
    districtCount: 117,
    villageCount: 1166,
    urbanVillageCount: 145,
    ruralVillageCount: 1021
  },
  regions: [
    {id:"52.01",name:"Kabupaten Lombok Barat",island:"Pulau Lombok"},
    {id:"52.02",name:"Kabupaten Lombok Tengah",island:"Pulau Lombok"},
    {id:"52.03",name:"Kabupaten Lombok Timur",island:"Pulau Lombok"},
    {id:"52.04",name:"Kabupaten Sumbawa",island:"Pulau Sumbawa"},
    {id:"52.05",name:"Kabupaten Dompu",island:"Pulau Sumbawa"},
    {id:"52.06",name:"Kabupaten Bima",island:"Pulau Sumbawa"},
    {id:"52.07",name:"Kabupaten Sumbawa Barat",island:"Pulau Sumbawa"},
    {id:"52.08",name:"Kabupaten Lombok Utara",island:"Pulau Lombok"},
    {id:"52.71",name:"Kota Mataram",island:"Pulau Lombok"},
    {id:"52.72",name:"Kota Bima",island:"Pulau Sumbawa"}
  ],
  hotels: [
    {id:"H001",code:"LT-001",name:"Kuta Paradiso Hotel",regionId:"52.02",district:"Pujut",village:"Kuta",address:"Kuta, Pujut, Lombok Tengah",roomTypeCount:4,roomCount:74,status:"Aktif",ownerId:"C001",picId:"C002",phone:"",updatedAt:"2026-09-18T08:30:00.000Z"},
    {id:"H002",code:"LT-002",name:"Novotel Lombok Resort",regionId:"52.02",district:"Pujut",village:"Kuta",address:"Mandalika, Kuta, Lombok Tengah",roomTypeCount:6,roomCount:102,status:"Aktif",ownerId:"C003",picId:"C004",phone:"",updatedAt:"2026-09-17T08:30:00.000Z"},
    {id:"H003",code:"LT-003",name:"Origin Lombok",regionId:"52.02",district:"Pujut",village:"Kuta",address:"Kuta, Lombok Tengah",roomTypeCount:5,roomCount:42,status:"Prospek",ownerId:"C005",picId:"C006",phone:"",updatedAt:"2026-09-15T08:30:00.000Z"},
    {id:"H004",code:"LB-001",name:"Senggigi Bay Resort",regionId:"52.01",district:"Batu Layar",village:"Senggigi",address:"Senggigi, Lombok Barat",roomTypeCount:5,roomCount:128,status:"Aktif",ownerId:"C001",picId:"C007",phone:"",updatedAt:"2026-09-14T08:30:00.000Z"},
    {id:"H005",code:"MT-001",name:"Mataram City Hotel",regionId:"52.71",district:"Cakranegara",village:"Cakranegara Barat",address:"Kota Mataram",roomTypeCount:3,roomCount:68,status:"Negosiasi",ownerId:"C008",picId:"C009",phone:"",updatedAt:"2026-09-12T08:30:00.000Z"},
    {id:"H006",code:"LU-001",name:"Gili Coast Hotel",regionId:"52.08",district:"Pemenang",village:"Gili Indah",address:"Gili Trawangan, Lombok Utara",roomTypeCount:4,roomCount:55,status:"Aktif",ownerId:"C010",picId:"C011",phone:"",updatedAt:"2026-09-10T08:30:00.000Z"},
    {id:"H007",code:"SB-001",name:"Sumbawa Seaside Inn",regionId:"52.04",district:"Sumbawa",village:"Lempeh",address:"Sumbawa Besar",roomTypeCount:3,roomCount:52,status:"Prospek",ownerId:"C012",picId:"C013",phone:"",updatedAt:"2026-09-08T08:30:00.000Z"},
    {id:"H008",code:"BM-001",name:"Bima Transit Hotel",regionId:"52.72",district:"Rasanae Barat",village:"Paruga",address:"Kota Bima",roomTypeCount:2,roomCount:36,status:"Prospek",ownerId:"C014",picId:"C015",phone:"",updatedAt:"2026-09-05T08:30:00.000Z"}
  ],
  contacts: [
    {id:"C001",role:"Owner",name:"Andi Pratama",company:"PT Nusantara Hospitality",phone:"081200000001",email:"andi@example.com"},
    {id:"C002",role:"PIC",name:"Rina Lestari",company:"Kuta Paradiso Hotel",phone:"081200000002",email:"rina@example.com"},
    {id:"C003",role:"Owner",name:"Budi Santoso",company:"Lombok Resort Group",phone:"081200000003",email:"budi@example.com"},
    {id:"C004",role:"PIC",name:"Dewi Anggraini",company:"Novotel Lombok Resort",phone:"081200000004",email:"dewi@example.com"},
    {id:"C005",role:"Owner",name:"Fahri Akbar",company:"Origin Hospitality",phone:"081200000005",email:"fahri@example.com"},
    {id:"C006",role:"PIC",name:"Nadia Putri",company:"Origin Lombok",phone:"081200000006",email:"nadia@example.com"},
    {id:"C007",role:"PIC",name:"Reza Maulana",company:"Senggigi Bay Resort",phone:"081200000007",email:"reza@example.com"},
    {id:"C008",role:"Owner",name:"Hendra Wijaya",company:"Mataram City Group",phone:"081200000008",email:"hendra@example.com"},
    {id:"C009",role:"PIC",name:"Sari Utami",company:"Mataram City Hotel",phone:"081200000009",email:"sari@example.com"},
    {id:"C010",role:"Owner",name:"Agus Rahman",company:"Gili Coast Group",phone:"081200000010",email:"agus@example.com"},
    {id:"C011",role:"PIC",name:"Fitriani",company:"Gili Coast Hotel",phone:"081200000011",email:"fitri@example.com"},
    {id:"C012",role:"Owner",name:"Yusuf Hadi",company:"Sumbawa Hospitality",phone:"081200000012",email:"yusuf@example.com"},
    {id:"C013",role:"PIC",name:"Linda Sari",company:"Sumbawa Seaside Inn",phone:"081200000013",email:"linda@example.com"},
    {id:"C014",role:"Owner",name:"Ridwan Saleh",company:"Bima Hotel Group",phone:"081200000014",email:"ridwan@example.com"},
    {id:"C015",role:"PIC",name:"Maya Hasan",company:"Bima Transit Hotel",phone:"081200000015",email:"maya@example.com"}
  ],
  roomTypes: [
    {id:"R001",code:"STD",name:"Standard",capacity:2,bedType:"Queen/Twin"},
    {id:"R002",code:"SUP",name:"Superior",capacity:2,bedType:"King/Twin"},
    {id:"R003",code:"DLX",name:"Deluxe",capacity:2,bedType:"King/Twin"},
    {id:"R004",code:"STE",name:"Suite",capacity:3,bedType:"King"},
    {id:"R005",code:"VIL",name:"Villa",capacity:4,bedType:"King + Twin"}
  ],
  prices: [
    {id:"P001",hotelId:"H001",roomTypeId:"R003",weekday:747500,weekend:825000,corporate:700000,ota:790000,effectiveDate:"2026-09-01"},
    {id:"P002",hotelId:"H002",roomTypeId:"R002",weekday:1035000,weekend:1150000,corporate:990000,ota:1095000,effectiveDate:"2026-09-01"},
    {id:"P003",hotelId:"H003",roomTypeId:"R003",weekday:682500,weekend:735000,corporate:650000,ota:715000,effectiveDate:"2026-09-01"},
    {id:"P004",hotelId:"H004",roomTypeId:"R002",weekday:890000,weekend:980000,corporate:830000,ota:1025000,effectiveDate:"2026-09-01"},
    {id:"P005",hotelId:"H005",roomTypeId:"R001",weekday:525000,weekend:575000,corporate:490000,ota:600000,effectiveDate:"2026-09-01"}
  ]
};
