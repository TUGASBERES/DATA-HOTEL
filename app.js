(() => {
  'use strict';
  const KEY = 'ntb-hospitality-data-v7';
  const LEGACY_KEYS = ['ntb-hospitality-data-v6','ntb-hospitality-data-v5','ntb-hospitality-data-v4'];
  const DEFAULT_PRICING_RULES = { developerFee:100000, closingFee:150000, applicationPercent:15.5 };
  const clone = v => JSON.parse(JSON.stringify(v));
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
  const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
  const num = n => new Intl.NumberFormat('id-ID').format(Number(n)||0);
  const date = v => v ? new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v)) : '-';
  const uid = p => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;

  const seed = clone(window.NTB_SEED);
  const state = { db: load(), route:'dashboard', filters:{dashboard:{regionId:'',district:'',village:''},hotels:{q:'',regionId:'',status:''},contacts:{q:'',role:''},prices:{q:''}}, global:'' };

  function normalizeDb(v){
    const d=clone(v||seed);
    d.version=7;
    d.contacts=Array.isArray(d.contacts)?d.contacts:[];
    d.hotels=Array.isArray(d.hotels)?d.hotels:[];
    d.pricingRules={...DEFAULT_PRICING_RULES,...(d.pricingRules||{})};
    if(window.NTB_REGIONS?.counts){ d.adminMaster={regencyCount:window.NTB_REGIONS.counts.regencies,districtCount:window.NTB_REGIONS.counts.districts,villageCount:window.NTB_REGIONS.counts.villages,urbanVillageCount:window.NTB_REGIONS.counts.kelurahan,ruralVillageCount:window.NTB_REGIONS.counts.desa}; }
    d.hotels.forEach(h=>{
      const owner=d.contacts.find(c=>c.id===h.ownerId);
      const pic=d.contacts.find(c=>c.id===h.picId);
      if(!h.ownerName&&owner) h.ownerName=owner.name||'';
      if(!h.ownerPhone&&owner) h.ownerPhone=owner.phone||'';
      if(!h.picName&&pic) h.picName=pic.name||'';
      if(!h.picPhone&&pic) h.picPhone=pic.phone||'';
      h.ownerName=h.ownerName||'';
      h.ownerPhone=h.ownerPhone||'';
      h.picName=h.picName||'';
      h.picPhone=h.picPhone||'';
    });
    return d;
  }
  function load(){
    try {
      const raw=localStorage.getItem(KEY);
      if(raw){ const v=normalizeDb(JSON.parse(raw)); localStorage.setItem(KEY,JSON.stringify(v)); return v; }
      for(const legacyKey of LEGACY_KEYS){
        const legacy=localStorage.getItem(legacyKey);
        if(legacy){ const v=normalizeDb(JSON.parse(legacy)); localStorage.setItem(KEY,JSON.stringify(v)); return v; }
      }
    } catch(e){}
    const v=normalizeDb(seed); localStorage.setItem(KEY,JSON.stringify(v)); return v;
  }
  function save(){ localStorage.setItem(KEY,JSON.stringify(state.db)); }
  function region(id){ return state.db.regions.find(x=>x.id===id); }
  function hotel(id){ return state.db.hotels.find(x=>x.id===id); }
  function contact(id){ return state.db.contacts.find(x=>x.id===id); }
  function room(id){ return state.db.roomTypes.find(x=>x.id===id); }
  function distinct(arr){ return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id')); }
  function masterRegency(regionId){ return window.NTB_REGIONS?.regencies?.find(r=>r.id===regionId); }
  function masterDistricts(regionId){ return masterRegency(regionId)?.districts||[]; }
  function masterDistrict(regionId,districtName){ return masterDistricts(regionId).find(d=>d.name===districtName); }
  function masterVillages(regionId,districtName){ return masterDistrict(regionId,districtName)?.villages||[]; }
  function ownerPicRecords(){
    const map=new Map();
    const add=(role,name,phone,h)=>{
      const n=String(name||'').trim(), p=String(phone||'').trim();
      if(!n&&!p) return;
      const key=`${role}|${p||n.toLowerCase()}`;
      if(!map.has(key)) map.set(key,{role,name:n||'-',phone:p||'-',hotels:[]});
      const row=map.get(key);
      if(h?.name&&!row.hotels.includes(h.name)) row.hotels.push(h.name);
    };
    state.db.hotels.forEach(h=>{
      add('Owner',h.ownerName,h.ownerPhone,h);
      add('PIC',h.picName,h.picPhone,h);
    });
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'id'));
  }
  function statusClass(s){ return String(s||'').toLowerCase().replaceAll(' ','-'); }
  function pricingRules(){ return {...DEFAULT_PRICING_RULES,...(state.db.pricingRules||{})}; }
  function priceBreakdown(base){
    const b=Math.max(0,Number(base)||0);
    if(!b) return {base:0,developer:0,closing:0,application:0,final:0};
    const r=pricingRules();
    const developer=Number(r.developerFee)||0;
    const closing=Number(r.closingFee)||0;
    const application=Math.round(b*(Number(r.applicationPercent)||0)/100);
    return {base:b,developer,closing,application,final:b+developer+closing+application};
  }
  function finalPrice(base){ return priceBreakdown(base).final; }
  function roundedPercentages(counts){
    const vals=counts.map(v=>Math.max(0,Number(v)||0)), total=vals.reduce((a,b)=>a+b,0);
    if(!total) return vals.map(()=>0);
    const raw=vals.map(v=>v/total*100), out=raw.map(Math.floor);
    let left=100-out.reduce((a,b)=>a+b,0);
    const order=raw.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>b.f-a.f||a.i-b.i);
    for(let n=0;n<left;n++) out[order[n%order.length].i]++;
    return out;
  }
  function donutGradient(items){
    const palette=['#4f8fe8','#43bc7e','#f2b43b','#e85f62','#7d5bd6','#29b6c8','#f48d48','#8bc34a'];
    if(!items.some(x=>x.pct>0)) return '#e9eef3';
    let start=0; const parts=[];
    items.forEach((x,i)=>{ const end=start+x.pct; if(x.pct>0) parts.push(`${palette[i%palette.length]} ${start}% ${end}%`); start=end; });
    return `conic-gradient(${parts.join(',')})`;
  }

  function route(){
    const hash=(location.hash||'#/dashboard').replace('#/','').split('?')[0];
    state.route=['dashboard','hotels','regions','rooms','prices','contacts','reports','settings'].includes(hash)?hash:'dashboard';
    $$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.route===state.route));
    render();
  }

  function render(){
    const app=$('#app');
    const views={dashboard:renderDashboard,hotels:renderHotels,regions:renderRegions,rooms:renderRooms,prices:renderPrices,contacts:renderContacts,reports:renderReports,settings:renderSettings};
    app.innerHTML=views[state.route]();
    bindView();
  }

  function head(title,sub){ return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><div class="admin-note">Hanya dapat diakses oleh admin</div></div>`; }
  function kpi(cls,icon,label,value,note=''){ return `<article class="kpi ${cls}"><div class="kpi-icon">${icon}</div><div><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(value)}</div>${note?`<div class="kpi-note">${esc(note)}</div>`:''}</div></article>`; }

  function dashboardFiltered(){
    const f=state.filters.dashboard;
    return state.db.hotels.filter(h=>(!f.regionId||h.regionId===f.regionId)&&(!f.district||h.district===f.district)&&(!f.village||h.village===f.village));
  }
  function dashboardFilterOptions(){
    const f=state.filters.dashboard;
    const districts=f.regionId?masterDistricts(f.regionId).map(d=>d.name):[];
    const villages=(f.regionId&&f.district)?masterVillages(f.regionId,f.district).map(v=>v.name):[];
    return {districts,villages};
  }

  function renderDashboard(){
    const m=state.db.adminMaster, f=state.filters.dashboard, opts=dashboardFilterOptions(), list=dashboardFiltered();
    const coverage=state.db.regions.map(r=>({r,count:state.db.hotels.filter(h=>h.regionId===r.id).length})).sort((a,b)=>b.count-a.count);
    const recent=[...state.db.hotels].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    const recentPrices=[...state.db.prices].sort((a,b)=>new Date(b.effectiveDate)-new Date(a.effectiveDate)).slice(0,5);
    const rawRoomCounts=state.db.roomTypes.map(rt=>({rt,count:state.db.prices.filter(p=>p.roomTypeId===rt.id).length}));
    const roomPct=roundedPercentages(rawRoomCounts.map(x=>x.count));
    const roomCounts=rawRoomCounts.map((x,i)=>({...x,pct:roomPct[i]}));
    return `${head('Dashboard','Database Hotel NTB (Admin)')}
      <section class="kpi-grid">
        ${kpi('blue','▰','Total Hotel',num(state.db.hotels.length),'Mengikuti record hotel tersimpan')}
        ${kpi('green','⌖','Kabupaten/Kota',num(m.regencyCount),'Master wilayah NTB')}
        ${kpi('yellow','▦','Kecamatan',num(m.districtCount),'Master wilayah NTB')}
        ${kpi('red','⌂','Desa/Kelurahan',num(m.villageCount),`${num(m.urbanVillageCount)} kelurahan + ${num(m.ruralVillageCount)} desa`)}
        ${kpi('purple','♟','Owner & PIC',num(ownerPicRecords().length),'Kontak dari data hotel')}
      </section>

      <section class="card filter-card section-gap">
        <h2 class="section-title">Cari Hotel di NTB</h2>
        <div class="filter-grid">
          <div class="field"><label>Pilih Kabupaten/Kota</label><select class="select" data-dash-filter="regionId"><option value="">Semua Kabupaten/Kota</option>${state.db.regions.map(r=>`<option value="${r.id}" ${f.regionId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Pilih Kecamatan</label><select class="select" data-dash-filter="district"><option value="">Semua Kecamatan</option>${opts.districts.map(v=>`<option ${f.district===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
          <div class="field"><label>Pilih Desa/Kelurahan</label><select class="select" data-dash-filter="village"><option value="">Semua Desa/Kelurahan</option>${opts.villages.map(v=>`<option ${f.village===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
          <button class="btn btn-primary search-btn" data-search-hotels>⌕ &nbsp;Cari Hotel</button>
        </div>
      </section>

      <section class="dashboard-grid section-gap">
        <article class="card card-pad" id="hotelSearchResults">
          <div class="data-head"><div><h2>Daftar Hotel</h2><p>Hasil filter: ${num(list.length)} data hotel</p></div><button class="link-btn" data-go="hotels">Lihat Semua →</button></div>
          <div class="table-wrap"><table><thead><tr><th>No</th><th>Nama Hotel</th><th>Kabupaten/Kota</th><th>Kecamatan</th><th>Desa/Kelurahan</th><th>Jumlah Tipe</th><th>Aksi</th></tr></thead><tbody>
          ${list.length?list.slice(0,8).map((h,i)=>`<tr><td>${i+1}</td><td><span class="cell-main">${esc(h.name)}</span><span class="cell-sub">${esc(h.code)}</span></td><td>${esc(region(h.regionId)?.name||'-')}</td><td>${esc(h.district||'-')}</td><td>${esc(h.village||'-')}</td><td>${num(h.roomTypeCount||0)}</td><td><button class="btn btn-secondary btn-sm" data-edit="hotel" data-id="${h.id}">Lihat / Edit</button></td></tr>`).join(''):`<tr><td colspan="7"><div class="empty"><b>Data tidak ditemukan</b>Ubah filter untuk melihat data lainnya.</div></td></tr>`}
          </tbody></table></div>
        </article>
        <article class="card card-pad">
          <div class="data-head"><div><h2>Cakupan Database</h2><p>Jumlah hotel tersimpan per kabupaten/kota</p></div></div>
          <div class="coverage-list">${coverage.map(x=>`<div class="coverage-row"><div><b>${esc(x.r.name.replace('Kabupaten ','Kab. '))}</b><small>${esc(x.r.island)}</small></div><div class="coverage-count">${num(x.count)}</div></div>`).join('')}</div>
        </article>
      </section>

      <section class="mini-grid section-gap">
        <article class="card card-pad"><div class="data-head"><div><h2>Data Hotel Terbaru</h2><p>Tanpa foto, berdasarkan update terakhir</p></div></div><ul class="list-clean">${recent.map(h=>`<li><div><b>${esc(h.name)}</b><span>${esc(region(h.regionId)?.name||'-')} · ${esc(h.district||'-')}</span></div><span>${date(h.updatedAt)}</span></li>`).join('')}</ul></article>
        <article class="card card-pad"><div class="data-head"><div><h2>Update Harga Terbaru</h2><p>Harga final setelah komponen otomatis</p></div></div><ul class="list-clean">${recentPrices.map(p=>`<li><div><b>${esc(hotel(p.hotelId)?.name||'-')}</b><span>${esc(room(p.roomTypeId)?.name||'-')}</span></div><div class="money">${money(finalPrice(p.weekday))}</div></li>`).join('')}</ul></article>
        <article class="card card-pad"><div class="data-head"><div><h2>Ringkasan Tipe Kamar</h2><p>Persentase distribusi rate</p></div></div><div class="donut-summary"><div class="donut-chart" style="background:${donutGradient(roomCounts)}"><div class="donut-hole"><span>Total</span><b>${num(roomCounts.reduce((a,x)=>a+x.count,0))}</b><small>Rate</small></div></div><div class="donut-legend">${roomCounts.map((x,i)=>`<div class="donut-legend-row"><span class="legend-dot dot-${i%8}"></span><div><b>${esc(x.rt.name)}</b><small>${num(x.count)} rate</small></div><strong>${x.pct}%</strong></div>`).join('')}</div></div></article>
      </section><div class="footer-note">Master wilayah NTB 2025 · Data hotel/owner/harga dihitung dari database aplikasi</div>`;
  }

  function toolbar(title,subtitle,type,filters=''){return `<section class="card toolbar-card"><div class="toolbar-top"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><div class="actions"><button class="btn btn-secondary" data-import>Import</button><button class="btn btn-secondary" data-export>Export</button>${type?`<button class="btn btn-primary" data-add="${type}">+ Tambah Data</button>`:''}</div></div>${filters?`<div class="toolbar-filters">${filters}</div>`:''}</section>`;}
  function renderHotels(){
    const f=state.filters.hotels; const q=(f.q||'').toLowerCase(); const list=state.db.hotels.filter(h=>{const txt=`${h.name} ${h.code} ${h.district} ${h.village} ${h.address} ${h.ownerName||''} ${h.ownerPhone||''} ${h.picName||''} ${h.picPhone||''}`.toLowerCase();return(!q||txt.includes(q))&&(!f.regionId||h.regionId===f.regionId)&&(!f.status||h.status===f.status)});
    return `${head('Data Hotel','Master data hotel NTB, tanpa foto')}${toolbar('Data Hotel',`${num(state.db.hotels.length)} record hotel`,'hotel',`<input class="input" data-filter="hotels.q" value="${esc(f.q)}" placeholder="Cari nama/kode/alamat..."><select class="select" data-filter="hotels.regionId"><option value="">Semua Kabupaten/Kota</option>${state.db.regions.map(r=>`<option value="${r.id}" ${f.regionId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select><select class="select" data-filter="hotels.status"><option value="">Semua Status</option>${['Aktif','Prospek','Negosiasi','Dormant'].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}</select>`)}<section class="card card-pad section-gap"><div class="table-wrap"><table><thead><tr><th>No</th><th>Kode / Hotel</th><th>Kabupaten/Kota</th><th>Kecamatan</th><th>Desa/Kelurahan</th><th>Alamat</th><th>Kamar</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${list.length?list.map((h,i)=>`<tr><td>${i+1}</td><td><span class="cell-main">${esc(h.name)}</span><span class="cell-sub">${esc(h.code)}</span></td><td>${esc(region(h.regionId)?.name||'-')}</td><td>${esc(h.district||'-')}</td><td>${esc(h.village||'-')}</td><td>${esc(h.address||'-')}</td><td>${num(h.roomCount||0)}</td><td><span class="status ${statusClass(h.status)}">${esc(h.status)}</span></td><td><button class="btn btn-secondary btn-sm" data-edit="hotel" data-id="${h.id}">Edit</button> <button class="btn btn-danger btn-sm" data-delete="hotel" data-id="${h.id}">Hapus</button></td></tr>`).join(''):`<tr><td colspan="9"><div class="empty"><b>Tidak ada data</b>Belum ada hotel yang sesuai filter.</div></td></tr>`}</tbody></table></div></section>`;
  }
  function renderRegions(){
    const counts=state.db.regions.map(r=>({...r,hotels:state.db.hotels.filter(h=>h.regionId===r.id).length,districts:masterDistricts(r.id).length,villages:masterDistricts(r.id).reduce((a,d)=>a+(d.villages?.length||0),0)}));
    return `${head('Data Wilayah','Master wilayah NTB dan cakupan data hotel')}${toolbar('Master Kabupaten/Kota','Master resmi seluruh kabupaten/kota, kecamatan, dan desa/kelurahan NTB.',null)}<section class="card card-pad section-gap"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Kabupaten/Kota</th><th>Pulau</th><th>Hotel</th><th>Kecamatan</th><th>Desa/Kel.</th></tr></thead><tbody>${counts.map(r=>`<tr><td>${r.id}</td><td><span class="cell-main">${esc(r.name)}</span></td><td>${esc(r.island)}</td><td>${num(r.hotels)}</td><td>${num(r.districts)}</td><td>${num(r.villages)}</td></tr>`).join('')}</tbody></table></div></section><section class="notice section-gap">Master administrasi penuh NTB: <b>${num(state.db.adminMaster.regencyCount)} kabupaten/kota</b>, <b>${num(state.db.adminMaster.districtCount)} kecamatan</b>, dan <b>${num(state.db.adminMaster.villageCount)} desa/kelurahan</b>. Dropdown wilayah hotel dan filter dashboard menggunakan master lengkap ini.</section>`;
  }
  function renderRooms(){return `${head('Tipe Kamar','Master tipe kamar')}${toolbar('Tipe Kamar',`${num(state.db.roomTypes.length)} tipe kamar`,'room')}<section class="card card-pad section-gap"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama</th><th>Kapasitas</th><th>Tipe Bed</th><th>Rate Terhubung</th><th>Aksi</th></tr></thead><tbody>${state.db.roomTypes.map(r=>`<tr><td>${esc(r.code)}</td><td><span class="cell-main">${esc(r.name)}</span></td><td>${num(r.capacity)} orang</td><td>${esc(r.bedType||'-')}</td><td>${num(state.db.prices.filter(p=>p.roomTypeId===r.id).length)}</td><td><button class="btn btn-secondary btn-sm" data-edit="room" data-id="${r.id}">Edit</button> <button class="btn btn-danger btn-sm" data-delete="room" data-id="${r.id}">Hapus</button></td></tr>`).join('')}</tbody></table></div></section>`;}
  function renderPrices(){
    const q=(state.filters.prices.q||'').toLowerCase();
    const list=state.db.prices.filter(p=>`${hotel(p.hotelId)?.name||''} ${room(p.roomTypeId)?.name||''}`.toLowerCase().includes(q));
    const r=pricingRules();
    return `${head('Harga Kamar','Harga final dihitung otomatis dari harga dasar')}${toolbar('Harga Kamar',`${num(state.db.prices.length)} rate tersimpan`,'price',`<input class="input" data-filter="prices.q" value="${esc(state.filters.prices.q)}" placeholder="Cari hotel / tipe kamar...">`)}
      <section class="notice section-gap pricing-rule"><b>Aturan harga otomatis:</b> Harga Final = Harga Dasar + <b>${money(r.developerFee)}</b> pengembang + <b>${money(r.closingFee)}</b> karyawan closing + <b>${String(r.applicationPercent).replace('.',',')}%</b> biaya aplikasi dari harga dasar.</section>
      <section class="card card-pad section-gap"><div class="table-wrap"><table><thead><tr><th>Hotel</th><th>Tipe</th><th>Weekday Final</th><th>Weekend Final</th><th>Corporate Final</th><th>OTA Final</th><th>Berlaku</th><th>Aksi</th></tr></thead><tbody>${list.length?list.map(p=>`<tr><td>${esc(hotel(p.hotelId)?.name||'-')}</td><td>${esc(room(p.roomTypeId)?.name||'-')}</td><td>${money(finalPrice(p.weekday))}<span class="cell-sub">Dasar ${money(p.weekday)}</span></td><td>${money(finalPrice(p.weekend))}<span class="cell-sub">Dasar ${money(p.weekend)}</span></td><td>${money(finalPrice(p.corporate))}<span class="cell-sub">Dasar ${money(p.corporate)}</span></td><td>${money(finalPrice(p.ota))}<span class="cell-sub">Dasar ${money(p.ota)}</span></td><td>${date(p.effectiveDate)}</td><td><button class="btn btn-secondary btn-sm" data-edit="price" data-id="${p.id}">Edit</button> <button class="btn btn-danger btn-sm" data-delete="price" data-id="${p.id}">Hapus</button></td></tr>`).join(''):`<tr><td colspan="8"><div class="empty"><b>Belum ada data harga</b>Tambahkan harga dasar untuk menghitung harga final otomatis.</div></td></tr>`}</tbody></table></div></section>`;
  }
  function renderContacts(){
    const f=state.filters.contacts,q=(f.q||'').toLowerCase();
    const all=ownerPicRecords();
    const list=all.filter(c=>`${c.name} ${c.phone} ${c.hotels.join(' ')}`.toLowerCase().includes(q)&&(!f.role||c.role===f.role));
    return `${head('Owner & PIC','Kontak Owner dan PIC tersinkron otomatis dari Data Hotel')}${toolbar('Owner & PIC',`${num(all.length)} kontak unik dari data hotel`,null,`<input class="input" data-filter="contacts.q" value="${esc(f.q)}" placeholder="Cari nama/no. telepon/hotel..."><select class="select" data-filter="contacts.role"><option value="">Semua Peran</option><option ${f.role==='Owner'?'selected':''}>Owner</option><option ${f.role==='PIC'?'selected':''}>PIC</option></select>`)}<section class="card card-pad section-gap"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Peran</th><th>No. Telepon</th><th>Hotel Terhubung</th></tr></thead><tbody>${list.length?list.map(c=>`<tr><td><span class="cell-main">${esc(c.name)}</span></td><td><span class="badge">${esc(c.role)}</span></td><td>${esc(c.phone||'-')}</td><td>${esc(c.hotels.join(', ')||'-')}</td></tr>`).join(''):`<tr><td colspan="4"><div class="empty"><b>Belum ada kontak</b>Isi Nama Owner/No. Owner atau Nama PIC/No. PIC pada Data Hotel.</div></td></tr>`}</tbody></table></div></section><section class="notice section-gap">Data pada halaman ini tidak diinput terpisah. Owner & PIC otomatis mengikuti record hotel sehingga selalu sinkron.</section>`;
  }
  function renderReports(){
    const totalRooms=state.db.hotels.reduce((a,h)=>a+(Number(h.roomCount)||0),0);const avg=state.db.prices.length?Math.round(state.db.prices.reduce((a,p)=>a+finalPrice(p.weekday),0)/state.db.prices.length):0;const covered=state.db.regions.filter(r=>state.db.hotels.some(h=>h.regionId===r.id)).length;
    return `${head('Laporan','Ringkasan database dan cakupan marketing')}${toolbar('Laporan Ringkas','Semua angka dihitung otomatis dari database',null)}<section class="report-grid section-gap"><article class="card report-box"><h3>Total Hotel</h3><strong>${num(state.db.hotels.length)}</strong><p>record tersimpan</p></article><article class="card report-box"><h3>Total Kamar</h3><strong>${num(totalRooms)}</strong><p>akumulasi jumlah kamar</p></article><article class="card report-box"><h3>Kab/Kota Tercover</h3><strong>${covered}/${state.db.adminMaster.regencyCount}</strong><p>wilayah dengan minimal 1 hotel</p></article><article class="card report-box"><h3>Owner & PIC</h3><strong>${num(ownerPicRecords().length)}</strong><p>kontak dari data hotel</p></article><article class="card report-box"><h3>Rate Tersimpan</h3><strong>${num(state.db.prices.length)}</strong><p>kombinasi hotel dan tipe kamar</p></article><article class="card report-box"><h3>Rata-rata Weekday Final</h3><strong style="font-size:19px">${money(avg)}</strong><p>sudah termasuk komponen harga otomatis</p></article></section><section class="card card-pad section-gap"><div class="data-head"><div><h2>Hotel per Kabupaten/Kota</h2><p>Distribusi record database</p></div></div><div class="table-wrap"><table><thead><tr><th>Kabupaten/Kota</th><th>Pulau</th><th>Hotel</th><th>% Database</th></tr></thead><tbody>${state.db.regions.map(r=>{const c=state.db.hotels.filter(h=>h.regionId===r.id).length;const pct=state.db.hotels.length?Math.round(c/state.db.hotels.length*100):0;return `<tr><td>${esc(r.name)}</td><td>${esc(r.island)}</td><td>${num(c)}</td><td>${pct}%</td></tr>`}).join('')}</tbody></table></div></section>`;
  }
  function renderSettings(){return `${head('Pengaturan','Backup, restore, dan reset database lokal')}${toolbar('Pengaturan Database','Data tersimpan di browser (localStorage)',null)}<section class="card card-pad section-gap"><div class="actions"><button class="btn btn-primary" data-export>Export / Backup JSON</button><button class="btn btn-secondary" data-import>Import JSON</button><button class="btn btn-danger" data-reset>Reset ke Data Contoh</button></div><div class="notice section-gap"><b>Catatan:</b> versi GitHub Pages ini tidak memakai database server. Untuk penggunaan banyak admin/perangkat, data sebaiknya dipindahkan ke Supabase atau Firebase.</div></section>`;}

  function bindView(){
    $$('[data-go]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.go}`);
    $('[data-dash-filter]').forEach(el=>el.onchange=()=>{ const k=el.dataset.dashFilter; state.filters.dashboard[k]=el.value; if(k==='regionId'){state.filters.dashboard.district='';state.filters.dashboard.village='';} if(k==='district')state.filters.dashboard.village=''; render(); });
    $('[data-search-hotels]').forEach(b=>b.onclick=()=>{
      const results=dashboardFiltered();
      const f=state.filters.dashboard;
      const labels=[];
      if(f.regionId) labels.push(region(f.regionId)?.name||f.regionId);
      if(f.district) labels.push(f.district);
      if(f.village) labels.push(f.village);
      toast(`${num(results.length)} hotel ditemukan${labels.length?' di '+labels.join(', '):''}`);
      setTimeout(()=>document.querySelector('#hotelSearchResults')?.scrollIntoView({behavior:'smooth',block:'start'}),50);
    });
    $('[data-filter]').forEach(el=>{const evt=el.tagName==='INPUT'?'input':'change';el.addEventListener(evt,()=>{const [grp,key]=el.dataset.filter.split('.');state.filters[grp][key]=el.value;render();});});
    $$('[data-add]').forEach(b=>b.onclick=()=>openForm(b.dataset.add));
    $$('[data-edit]').forEach(b=>b.onclick=()=>openForm(b.dataset.edit,b.dataset.id));
    $$('[data-delete]').forEach(b=>b.onclick=()=>remove(b.dataset.delete,b.dataset.id));
    $$('[data-export]').forEach(b=>b.onclick=exportData);
    $$('[data-import]').forEach(b=>b.onclick=()=>$('#importFile').click());
    $$('[data-reset]').forEach(b=>b.onclick=resetData);
  }

  function field(label,name,value='',type='text',extra=''){return `<div class="field ${extra.includes('full')?'full-span':''}"><label>${esc(label)}</label><input class="input" name="${name}" value="${esc(value)}" type="${type}" ${extra.replace('full','')}></div>`;}
  function selectField(label,name,options,value='',extra=''){return `<div class="field ${extra.includes('full')?'full-span':''}"><label>${esc(label)}</label><select class="select" name="${name}">${options.map(o=>{const v=typeof o==='string'?o:o.value,n=typeof o==='string'?o:o.label;return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(n)}</option>`}).join('')}</select></div>`;}
  function openForm(type,id=''){
    const map={hotel:'Hotel',room:'Tipe Kamar',price:'Harga Kamar',contact:'Owner / PIC'}; $('#modalTitle').textContent=`${id?'Edit':'Tambah'} ${map[type]}`; $('#modalSubtitle').textContent='Data tanpa foto. Isi informasi yang diperlukan.'; const form=$('#modalForm'); let item;
    if(type==='hotel'){item=state.db.hotels.find(x=>x.id===id)||{};form.innerHTML=`${field('Kode Hotel','code',item.code||'')}${field('Nama Hotel','name',item.name||'')}${selectField('Kabupaten/Kota','regionId',[{value:'',label:'Pilih wilayah'},...state.db.regions.map(r=>({value:r.id,label:r.name}))],item.regionId||'')}${field('Kecamatan','district',item.district||'')}${field('Desa/Kelurahan','village',item.village||'')}${field('Alamat','address',item.address||'','text','full')}${field('Jumlah Tipe Kamar','roomTypeCount',item.roomTypeCount||0,'number')}${field('Jumlah Kamar','roomCount',item.roomCount||0,'number')}${selectField('Status','status',['Aktif','Prospek','Negosiasi','Dormant'],item.status||'Prospek')}${field('Telepon Hotel','phone',item.phone||'')}${field('Nama Owner','ownerName',item.ownerName||'')}${field('No. Owner','ownerPhone',item.ownerPhone||'','tel')}${field('Nama PIC','picName',item.picName||'')}${field('No. PIC','picPhone',item.picPhone||'','tel')}${formActions(type,id)}`;}
    if(type==='room'){item=state.db.roomTypes.find(x=>x.id===id)||{};form.innerHTML=`${field('Kode','code',item.code||'')}${field('Nama Tipe','name',item.name||'')}${field('Kapasitas','capacity',item.capacity||2,'number')}${field('Tipe Bed','bedType',item.bedType||'')}${formActions(type,id)}`;}
    if(type==='contact'){item=state.db.contacts.find(x=>x.id===id)||{};form.innerHTML=`${selectField('Peran','role',['Owner','PIC'],item.role||'PIC')}${field('Nama','name',item.name||'')}${field('Perusahaan / Hotel','company',item.company||'')}${field('Telepon','phone',item.phone||'')}${field('Email','email',item.email||'','email','full')}${formActions(type,id)}`;}
    if(type==='price'){
      item=state.db.prices.find(x=>x.id===id)||{};
      form.innerHTML=`${selectField('Hotel','hotelId',[{value:'',label:'Pilih hotel'},...state.db.hotels.map(h=>({value:h.id,label:h.name}))],item.hotelId||'')}${selectField('Tipe Kamar','roomTypeId',[{value:'',label:'Pilih tipe'},...state.db.roomTypes.map(r=>({value:r.id,label:r.name}))],item.roomTypeId||'')}${field('Weekday (Harga Dasar)','weekday',item.weekday||0,'number','min="0" step="1"')}${field('Weekend (Harga Dasar)','weekend',item.weekend||0,'number','min="0" step="1"')}${field('Corporate (Harga Dasar)','corporate',item.corporate||0,'number','min="0" step="1"')}${field('OTA (Harga Dasar)','ota',item.ota||0,'number','min="0" step="1"')}${field('Tanggal Berlaku','effectiveDate',item.effectiveDate||new Date().toISOString().slice(0,10),'date','full')}<div class="price-preview full-span" id="pricePreview"></div>${formActions(type,id)}`;
    }
    form.onsubmit=e=>saveForm(e,type,id);
    $('#modalBackdrop').classList.remove('hidden');
    if(type==='price') bindPricePreview(form);
    if(type==='hotel') bindHotelRegionSelects(form);
  }
  function bindHotelRegionSelects(form){
    const oldDistrict=form.elements.district, oldVillage=form.elements.village, regionSelect=form.elements.regionId;
    if(!oldDistrict||!oldVillage||!regionSelect) return;
    const district=document.createElement('select'); district.className='select'; district.name='district';
    const village=document.createElement('select'); village.className='select'; village.name='village';
    oldDistrict.replaceWith(district); oldVillage.replaceWith(village);
    const fillDistricts=(keep='')=>{
      district.innerHTML='<option value="">Pilih kecamatan</option>'+masterDistricts(regionSelect.value).map(d=>'<option value="'+esc(d.name)+'">'+esc(d.name)+'</option>').join('');
      if([...district.options].some(o=>o.value===keep)) district.value=keep;
    };
    const fillVillages=(keep='')=>{
      village.innerHTML='<option value="">Pilih desa/kelurahan</option>'+masterVillages(regionSelect.value,district.value).map(v=>'<option value="'+esc(v.name)+'">'+esc(v.name)+' ('+esc(v.type)+')</option>').join('');
      if([...village.options].some(o=>o.value===keep)) village.value=keep;
    };
    const initialDistrict=oldDistrict.value||'', initialVillage=oldVillage.value||'';
    fillDistricts(initialDistrict); fillVillages(initialVillage);
    regionSelect.addEventListener('change',()=>{ fillDistricts(''); fillVillages(''); });
    district.addEventListener('change',()=>fillVillages(''));
  }
  function bindPricePreview(form){
    const keys=['weekday','weekend','corporate','ota'];
    const labels={weekday:'Weekday',weekend:'Weekend',corporate:'Corporate',ota:'OTA'};
    const box=$('#pricePreview');
    const draw=()=>{
      const r=pricingRules();
      box.innerHTML=`<div class="preview-title"><b>Preview Harga Final</b><span>+ ${money(r.developerFee)} pengembang · + ${money(r.closingFee)} closing · + ${String(r.applicationPercent).replace('.',',')}% aplikasi</span></div><div class="preview-grid">${keys.map(k=>{const p=priceBreakdown(form.elements[k]?.value);return `<div class="preview-item"><small>${labels[k]}</small><b>${money(p.final)}</b><span>Dasar ${money(p.base)} · Aplikasi ${money(p.application)}</span></div>`}).join('')}</div>`;
    };
    keys.forEach(k=>form.elements[k]?.addEventListener('input',draw));
    draw();
  }
  function formActions(type,id){return `<div class="form-actions"><button type="button" class="btn btn-secondary" data-cancel>Batal</button><button type="submit" class="btn btn-primary">Simpan Data</button></div>`;}
  function saveForm(e,type,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());let arr,key,prefix;if(type==='hotel'){arr=state.db.hotels;key='hotel';prefix='H';d.roomTypeCount=+d.roomTypeCount||0;d.roomCount=+d.roomCount||0;d.updatedAt=new Date().toISOString();}if(type==='room'){arr=state.db.roomTypes;key='room';prefix='R';d.capacity=+d.capacity||0;}if(type==='contact'){arr=state.db.contacts;key='contact';prefix='C';}if(type==='price'){arr=state.db.prices;key='price';prefix='P';['weekday','weekend','corporate','ota'].forEach(k=>d[k]=+d[k]||0);}if(id){const i=arr.findIndex(x=>x.id===id);arr[i]={...arr[i],...d};}else{arr.push({id:uid(prefix),...d});}save();closeModal();toast('Data berhasil disimpan');render();}
  function remove(type,id){let arr;if(type==='hotel'){if(state.db.prices.some(p=>p.hotelId===id))return toast('Hotel masih terhubung ke data harga. Hapus rate terlebih dahulu.');arr=state.db.hotels;}if(type==='room'){if(state.db.prices.some(p=>p.roomTypeId===id))return toast('Tipe kamar masih terhubung ke harga.');arr=state.db.roomTypes;}if(type==='contact'){if(state.db.hotels.some(h=>h.ownerId===id||h.picId===id))return toast('Kontak masih terhubung ke hotel.');arr=state.db.contacts;}if(type==='price')arr=state.db.prices;if(!arr||!confirm('Hapus data ini?'))return;arr.splice(arr.findIndex(x=>x.id===id),1);save();toast('Data dihapus');render();}
  function closeModal(){$('#modalBackdrop').classList.add('hidden');}
  function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;$('#toastStack').appendChild(e);setTimeout(()=>e.remove(),2600);}
  function exportData(){const b=new Blob([JSON.stringify(state.db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ntb-hospitality-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);}
  function importData(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.hotels||!d.regions)throw new Error();d=normalizeDb(d);state.db=d;save();toast('Import berhasil');render();}catch(e){toast('File JSON tidak valid');}};r.readAsText(file);}
  function resetData(){if(!confirm('Reset semua data lokal ke data contoh?'))return;state.db=normalizeDb(seed);save();toast('Database direset');render();}
  function globalSearch(q){state.global=q; if(!q.trim())return;state.filters.hotels.q=q;location.hash='#/hotels';}

  $('#modalClose').onclick=closeModal; $('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal();}; document.addEventListener('click',e=>{if(e.target.matches('[data-cancel]'))closeModal();});
  $('#backupBtn').onclick=exportData; $('#importFile').onchange=e=>{const f=e.target.files[0];if(f)importData(f);e.target.value='';};
  let st; $('#globalSearch').oninput=e=>{clearTimeout(st);st=setTimeout(()=>globalSearch(e.target.value),350);};
  $('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open'); window.addEventListener('hashchange',()=>{route();$('#sidebar').classList.remove('open');});
  route();
})();
