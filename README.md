# Kelas Mengaji Ustazah Aina

Laman web interaktif untuk pengurusan kelas mengaji — kehadiran, kemajuan bacaan,
yuran dan resit. Satu fail HTML sahaja, tiada CDN, tiada pustaka luar.

## Fail

| Fail | Guna |
|---|---|
| `index.html` | Seluruh laman (HTML + CSS + JS) |
| `Code.gs` | Skrip untuk Google Sheet (backend) |
| `.nojekyll` | Supaya GitHub Pages tidak memproses fail |

## Cara publish di GitHub Pages

1. Buat repositori baharu, contoh `kelas-mengaji-aina`.
2. Muat naik `index.html`, `.nojekyll` dan `README.md`.
3. Settings > Pages > Source: **Deploy from a branch** > Branch: `main` / `(root)` > Save.
4. Tunggu 1–2 minit. Laman akan berada di
   `https://<namauser>.github.io/kelas-mengaji-aina/`

## Cara sambung ke Google Sheet

1. Buka Google Sheet baharu (guna **Gmail peribadi**, bukan akaun sekolah).
2. Extensions > Apps Script > padam kod contoh > tampal isi `Code.gs`.
3. Tukar `KATA_KUNCI` kepada kata kunci rahsia anda.
4. Deploy > New deployment > Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin URL `…/exec`.
6. Di laman: **Data & Tetapan** > tampal URL + kata kunci > Simpan.
7. Tekan **↑ Hantar ke Sheet** sekali untuk mencipta semua tab.

Selepas ini setiap perubahan di laman akan dihantar ke Sheet secara automatik.
Jika anda edit terus dalam Sheet, tekan **↓ Muat turun dari Sheet** di laman.

## Log masuk

- **Ustazah (admin)** — kata laluan lalai `aina2026` (tukar di Data & Tetapan)
- **Pelajar** — pilih nama, kata laluan ditetapkan dalam rekod pelajar

Pelajar hanya nampak rekod sendiri dan tidak boleh mengedit apa-apa.

## Nota

- Data juga disimpan dalam pelayar (localStorage) sebagai salinan luar talian.
- Resit dijana melalui tetingkap cetak pelayar — pilih **Save as PDF**.
- Butang WhatsApp membuka `wa.me` dengan teks resit yang telah disiapkan.
- Dwiklik mana-mana baris jadual untuk edit atau hapus.

Disediakan oleh **Ustazah Aina**.
