/**
 * KELAS MENGAJI USTAZAH AINA — Backend Google Sheet
 * ------------------------------------------------
 * Cara guna:
 *  1. Buka Google Sheet baharu (guna akaun Gmail peribadi).
 *  2. Menu Extensions > Apps Script. Padam kod contoh, tampal fail ini.
 *  3. Tukar KATA_KUNCI di bawah kepada kata kunci rahsia anda sendiri.
 *  4. Deploy > New deployment > Type: Web app
 *       Execute as: Me
 *       Who has access: Anyone
 *  5. Salin URL /exec, tampal dalam laman > Data & Tetapan.
 *
 * PENTING: Setiap kali kod ini diedit, kena buat "New version" semasa
 * deploy (Deploy > Manage deployments > pensel > Version: New version
 * > Deploy) — kalau tidak, URL /exec lama akan terus guna kod LAMA.
 *
 * Helaian (tab) akan dicipta automatik: Pelajar, Kehadiran, Bayaran, Komen, Tetapan.
 * Anda boleh edit terus dalam Sheet, kemudian tekan "Muat turun dari Sheet" di laman.
 */

var KATA_KUNCI = 'rahsia-kelas-aina';   // <<< TUKAR INI

var SKEMA = {
  Pelajar:   ['id','nama','penjaga','tel','kategori','mukaSurat','tempoh','hari','masa','yuran','mula','kl','keluarga','aktif'],
  Kehadiran: ['id','pelajarId','tarikh','status','tempoh','msDari','msHingga','catatan'],
  Bayaran:   ['id','pelajarId','tarikh','untukBulan','jumlah','kaedah','rujukan','catatan'],
  Komen:     ['id','pelajarId','tarikh','jenis','teks']
};
var NOMBOR = ['mukaSurat','tempoh','yuran','msDari','msHingga','jumlah'];

// Lajur yang MESTI kekal sebagai teks — elak Google Sheets tukar
// automatik kepada jenis sel Date/Time (punca "masa"/"tarikh" jadi
// pelik macam 1899-12-30 atau ada GMT bila dibaca semula).
var LAJUR_TEKS = {
  Pelajar:   ['masa', 'mula'],
  Kehadiran: ['tarikh'],
  Bayaran:   ['tarikh']
};

function balas(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function helaian(nama, tajuk) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nama);
  if (!sh) {
    sh = ss.insertSheet(nama);
    sh.getRange(1, 1, 1, tajuk.length).setValues([tajuk])
      .setFontWeight('bold').setBackground('#4C1D95').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

function keTeks(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}

// Macam keTeks(), tapi untuk lajur waktu (contoh "masa") — kalau Sheets
// dah terlanjur tukar sel tu jadi Date/Time, format sebagai HH:mm sahaja,
// bukan tarikh penuh.
function keTeksWaktu(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  return v === null || v === undefined ? '' : String(v);
}

function bacaHelaian(nama) {
  var tajuk = SKEMA[nama];
  var sh = helaian(nama, tajuk);
  var n = sh.getLastRow();
  if (n < 2) return [];
  var nilai = sh.getRange(2, 1, n - 1, tajuk.length).getValues();
  return nilai.filter(function (r) { return String(r[0]).trim() !== ''; })
    .map(function (r) {
      var o = {};
      tajuk.forEach(function (t, i) {
        var v = r[i];
        if (t === 'hari') {
          o.hari = keTeks(v).split(',').map(function (x) { return parseInt(x, 10); })
                    .filter(function (x) { return !isNaN(x); });
        } else if (t === 'aktif') {
          o.aktif = !(keTeks(v).toLowerCase() === 'tidak' || v === false);
        } else if (t === 'masa') {
          o.masa = keTeksWaktu(v);
        } else if (NOMBOR.indexOf(t) >= 0) {
          o[t] = Number(v) || 0;
        } else {
          o[t] = keTeks(v);
        }
      });
      return o;
    });
}

function tulisHelaian(nama, senarai) {
  var tajuk = SKEMA[nama];
  var sh = helaian(nama, tajuk);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, tajuk.length).clearContent();
  if (!senarai || !senarai.length) return;
  var baris = senarai.map(function (o) {
    return tajuk.map(function (t) {
      if (t === 'hari') return (o.hari || []).join(',');
      if (t === 'aktif') return o.aktif === false ? 'Tidak' : 'Ya';
      var v = o[t];
      return v === null || v === undefined ? '' : v;
    });
  });
  // paksa lajur waktu/tarikh sebagai TEKS dahulu, sebelum tulis nilai —
  // supaya Sheets tak automatik tukar "16:00" jadi sel jenis Time.
  (LAJUR_TEKS[nama] || []).forEach(function (medan) {
    var idx = tajuk.indexOf(medan);
    if (idx >= 0) sh.getRange(2, idx + 1, baris.length, 1).setNumberFormat('@');
  });
  sh.getRange(2, 1, baris.length, tajuk.length).setValues(baris);
}

function bacaTetapan() {
  var sh = helaian('Tetapan', ['kunci', 'nilai']);
  var n = sh.getLastRow();
  var o = {};
  if (n >= 2) {
    sh.getRange(2, 1, n - 1, 2).getValues().forEach(function (r) {
      if (r[0]) o[String(r[0])] = keTeks(r[1]);
    });
  }
  if (o.yuranLalai) o.yuranLalai = Number(o.yuranLalai) || 0;
  return o;
}

function tulisTetapan(t) {
  var sh = helaian('Tetapan', ['kunci', 'nilai']);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).clearContent();
  var simpan = ['klAdmin', 'yuranLalai', 'telUstazah'];   // URL & token tidak disimpan di sini
  var baris = simpan.filter(function (k) { return t[k] !== undefined; })
                    .map(function (k) { return [k, t[k]]; });
  if (baris.length) sh.getRange(2, 1, baris.length, 2).setValues(baris);
}

function doGet(e) {
  try {
    var p = e && e.parameter ? e.parameter : {};
    if (p.kunci !== KATA_KUNCI) return balas({ ok: false, ralat: 'Kata kunci salah' });
    return balas({
      ok: true,
      data: {
        pelajar: bacaHelaian('Pelajar'),
        kehadiran: bacaHelaian('Kehadiran'),
        bayaran: bacaHelaian('Bayaran'),
        komen: bacaHelaian('Komen'),
        tetapan: bacaTetapan()
      }
    });
  } catch (err) {
    return balas({ ok: false, ralat: String(err) });
  }
}

function doPost(e) {
  var kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(20000);
    var badan = JSON.parse(e.postData.contents);
    if (badan.kunci !== KATA_KUNCI) return balas({ ok: false, ralat: 'Kata kunci salah' });
    var d = badan.data || {};
    tulisHelaian('Pelajar', d.pelajar);
    tulisHelaian('Kehadiran', d.kehadiran);
    tulisHelaian('Bayaran', d.bayaran);
    tulisHelaian('Komen', d.komen);
    if (d.tetapan) tulisTetapan(d.tetapan);
    return balas({ ok: true, masa: new Date().toISOString() });
  } catch (err) {
    return balas({ ok: false, ralat: String(err) });
  } finally {
    try { kunci.releaseLock(); } catch (x) {}
  }
}
