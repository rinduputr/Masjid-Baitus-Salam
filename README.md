# Masjid Baitus Salam — Digital Signage

Static HTML/CSS/JavaScript/JSON project, siap untuk GitHub Pages.

## Fitur
- Jam & tanggal realtime
- Jadwal salat otomatis berdasarkan geolocation browser
- Fallback koordinat Bekasi
- Countdown menuju salat terdekat
- Highlight salat berikutnya
- Metode perhitungan Kementerian Agama Republik Indonesia
- Pengumuman, agenda, quote, running text
- Placeholder QRIS
- Responsive mobile/tablet/TV
- Data konten terpisah di `data/config.json`

## Struktur
- `index.html`
- `style.css`
- `app.js`
- `data/config.json`
- `assets/`

## GitHub Pages
Upload seluruh isi folder ini ke repository. GitHub Pages dapat menerbitkan file HTML/CSS/JS statis langsung dari repository.

## Catatan waktu salat
Aplikasi meminta izin lokasi dari browser. Jika izin lokasi ditolak, aplikasi memakai koordinat default Bekasi. Waktu dihitung dari API AlAdhan menggunakan metode 20 (Kementerian Agama Republik Indonesia).

Untuk TV/Android TV, pastikan browser/perangkat mengizinkan lokasi atau ubah fallback di `app.js`.

## Kustomisasi
Edit `data/config.json` untuk pengumuman, agenda, quote, dan running text.
