<div align="center">
  <h1 align="center">🌌 Vibe Commit</h1>
  <p align="center"><strong>Gamer-Style RPG Quest Command Hub & Task Gamification System</strong></p>
  <p align="center">Ubah rutinitas harian Anda menjadi rangkaian <em>Quest</em> legendaris dengan perhitungan matematis Bayesian dan hukuman inaktivitas real-time!</p>
</div>

---

## 🚀 Apa itu Vibe Commit?
**Vibe Commit** adalah aplikasi manajemen tugas (*Task Manager*) bergaya RPG (*Role-Playing Game*) premium yang dirancang untuk meningkatkan konsistensi diri. Dengan menghilangkan ketergantungan AI eksternal, aplikasi ini sepenuhnya berfokus pada mekanik manual RPG murni dan pemodelan statistik presisi untuk mengukur performa harian Anda.

Setiap tugas didefinisikan sebagai **Quest** yang memberikan hadiah EXP dan memulihkan stamina Anda, sementara penundaan akan memicu penalti HP dan Mana harian yang memaksa Anda untuk tetap disiplin!

---

## 💎 Fitur Utama & Sistem RPG

### 👑 1. Quest Command Hub (Papan Misi)
* **Kategori Quest**: 
  * 👑 **Main Quest** (Tujuan Utama)
  * 📅 **Daily Quest** (Misi Harian)
  * 📌 **Side Quest** (Tugas Tambahan)
* **Tipe Misi**:
  * 🔄 **Rutinitas (Habit)**: Misi berulang yang konsistensinya diukur secara statistik.
  * ⚡ **Sekali Jalan (One-Off)**: Tugas sekali rampung yang memberikan semburan hadiah tak terduga (*Gacha Burst EXP* berkisar 1.5x s.d. 3.0x).

### 🧮 2. Model Probabilitas Bayesian (Habit Consistency)
Menggunakan rumus **Beta-Bernoulli Conjugacy** & **Laplace smoothing** untuk menghitung probabilitas konsistensi harian secara dinamis (`vibeMath.ts`):
* Setiap keberhasilan log quest memperkuat prior Anda ($\alpha$).
* Hari-hari inaktivitas memicu faktor peluruhan (*decay factor* $\beta$) asimtotik yang berbobot terhadap tingkat kesulitan tugas.
* Kebiasaan yang sudah terbentuk kokoh (*repetition count* tinggi) memiliki daya tahan peluruhan (*forgetting curve*) yang lebih tangguh dibandingkan habit baru.

### 🛡️ 3. RPG Status & Toko Koin (Item Shop)
* **HP & Mana**:
  * Terlalu lama mengabaikan quest harian akan memicu penalti HP.
  * Menyelesaikan quest memulihkan +5 HP (maksimal 100).
  * Quest pertama di hari baru memulihkan +30 Mana (Energi Fokus). Quest berikutnya mengonsumsi -10 Mana.
* **Item Shop**: Tukarkan koin yang Anda kumpulkan dengan ramuan penambah HP/Mana, *Streak Shield* (Perisai Penghalang Penalti), atau pilihan kustomisasi judul estetika (*titles & colors*).

### 🧪 4. Developer Sandbox Panel
* Panel debugging khusus developer untuk memanipulasi HP, Mana, dan Level secara real-time.
* Dapat memajukan/mengubah simulasi tanggal kalender (*Sandbox Date Offset*) untuk menguji efek penalti inaktivitas dan peluruhan probabilitas Bayesian secara instan.

---

## 🛠️ Stack Teknologi

* **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Zustand (State Management), Framer Motion.
* **Backend**: Node.js, Express, PostgreSQL.
* **Database**: PostgreSQL (Prisma ORM / Raw Client).

---

## ⚙️ Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
* **Node.js** (v18 atau lebih tinggi)
* **PostgreSQL** aktif di lokal

### 1. Kloning & Persiapan Database
1. Pastikan PostgreSQL berjalan dan buat sebuah database baru (misal: `vibe_commit`).
2. Masuk ke folder backend dan sesuaikan file `.env` database:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/vibe_commit"
   PORT=5000
   ```

### 2. Instalasi Dependensi
Jalankan perintah ini di root repositori untuk memasang seluruh pustaka frontend dan backend:
```bash
npm install
```

### 3. Migrasi Database
Jalankan proses inisialisasi tabel PostgreSQL:
```bash
npm run migrate
```

### 4. Jalankan Aplikasi
Jalankan server pengembangan frontend dan backend secara bersamaan:
```bash
npm run dev
```
Aplikasi frontend akan otomatis berjalan di [http://localhost:5173](http://localhost:5173) dan backend di [http://localhost:5000](http://localhost:5000).

---

## 📄 Lisensi
Hak Cipta © 2026 Vibe Commit Team. Dibuat untuk meningkatkan konsistensi pengembang perangkat lunak melalui gamifikasi tingkat tinggi.
