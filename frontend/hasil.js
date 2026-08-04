document.addEventListener("DOMContentLoaded", () => {
  // WAKTU BUKA HASIL: 17 Agustus 2026 Pukul 06:00:00 WIB
  const targetWaktuBuka = new Date(2026, 7, 17, 6, 0, 0).getTime();

  const envelopeTitle = document.getElementById("envelope-title");
  const envelopeSubtitle = document.getElementById("envelope-subtitle");
  const envelopeFlap = document.getElementById("envelope-flap");
  const envelopeLetter = document.getElementById("envelope-letter");
  const countdownBox = document.getElementById("countdown-box");
  const countdownTimer = document.getElementById("countdown-timer");

  // Matikan animasi CSS default agar amplop tidak membuka sendiri
  if (envelopeFlap) envelopeFlap.style.animation = "none";
  if (envelopeLetter) envelopeLetter.style.animation = "none";

  // Cek Status Waktu
  const sekarang = new Date().getTime();

  if (sekarang < targetWaktuBuka) {
    // === SKENARIO 1: BELUM WAKTUNYA (COUNTDOWN AKTIF) ===
    if (envelopeTitle) envelopeTitle.textContent = "Pengumuman Hasil Pemilu";
    if (envelopeSubtitle) envelopeSubtitle.textContent = "Hasil pemilihan belum dapat dibuka.";
    if (countdownBox) countdownBox.classList.remove("hidden");
    if (countdownBox) countdownBox.classList.add("flex");

    // Update Hitung Mundur Setiap Detik
    const timerInterval = setInterval(() => {
      const current = new Date().getTime();
      const sisaWaktu = targetWaktuBuka - current;

      if (sisaWaktu <= 0) {
        clearInterval(timerInterval);
        location.reload(); // Refresh otomatis jika waktu sudah habis
        return;
      }

      // Kalkulasi Hari, Jam, Menit, Detik
      const days = Math.floor(sisaWaktu / (1000 * 60 * 60 * 24));
      const hours = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((sisaWaktu % (1000 * 60)) / 1000);

      if (countdownTimer) {
        countdownTimer.textContent = `${padZero(days)}d : ${padZero(hours)}h : ${padZero(minutes)}m : ${padZero(seconds)}s`;
      }
    }, 1000);

  } else {
    // === SKENARIO 2: SUDAH WAKTUNYA (BUKA AMPLOP & AMBIL DATA BACKEND) ===
    jalankanProsesBukaHasil();
  }
});

// Helper untuk format angka 01, 02, dst.
function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

// Fungsi utama membuka hasil dan mengambil data dari Server
async function jalankanProsesBukaHasil() {
  const envelopeScreen = document.getElementById("envelope-screen");
  const mainContent = document.getElementById("main-content");
  const navMenu = document.getElementById("nav-menu");
  const envelopeFlap = document.getElementById("envelope-flap");
  const envelopeLetter = document.getElementById("envelope-letter");

  // Aktifkan kembali animasi pembukaan amplop
  if (envelopeFlap) envelopeFlap.style.animation = "openFlap 1s 0.5s forwards";
  if (envelopeLetter) envelopeLetter.style.animation = "pullLetter 1.5s 1.2s forwards";

  // Fetch Data dari Server/Backend
  await fetchHasilVotingFromBackend();

  // Transisi Layar dari Amplop ke Halaman Utama
  setTimeout(() => {
    if (envelopeScreen) envelopeScreen.classList.add("fade-out");
    
    setTimeout(() => {
      if (envelopeScreen) envelopeScreen.style.display = "none";
      if (mainContent) {
        mainContent.classList.remove("hidden");
        mainContent.classList.add("fade-in");
      }
      if (navMenu) navMenu.classList.add("fade-in");
    }, 1000);
  }, 3500);
}

// Fungsi terhubung ke Endpoint Backend
async function fetchHasilVotingFromBackend() {
  try {
    const res = await fetch('http://localhost:3000/api/public/results');
    if (!res.ok) throw new Error('Gagal memuat hasil dari server');
    
    const data = await res.json();
    console.log("Data diterima dari Backend:", data); // Untuk verifikasi di Console

    // 1. Ambil total suara (konversi aman ke Number/Float)
    const totalSuara = parseFloat(data.total_suara || 0);

    // 2. Cari data kandidat dari array
    const khairulData = data.kandidat?.find(k => k.id === 1 || (k.nama && k.nama.toLowerCase().includes("khairul"))) || {};
    const kotakKosongData = data.kandidat?.find(k => k.id === 4 || (k.nama && k.nama.toLowerCase().includes("kotak"))) || {};

    // 3. Tangkap nilai suara (cek properti 'total_bobot' ATAU 'suara')
    const nilaiKhairul = parseFloat(khairulData.total_bobot ?? khairulData.suara ?? 0);
    const nilaiKotak = parseFloat(kotakKosongData.total_bobot ?? kotakKosongData.suara ?? 0);

    // 4. Hitung Persentase (Mencegah pembagian dengan nol)
    const persenKhairul = totalSuara > 0 ? ((nilaiKhairul / totalSuara) * 100).toFixed(1) : "0";
    const persenKotak = totalSuara > 0 ? ((nilaiKotak / totalSuara) * 100).toFixed(1) : "0";

    // 5. Update Elemen HTML - Khairul Arief Rahman
    const elPersen2 = document.getElementById('persen-2');
    const elSuara2 = document.getElementById('suara-2');
    if (elPersen2) elPersen2.textContent = `${persenKhairul}%`;
    if (elSuara2) elSuara2.textContent = `${nilaiKhairul} DARI ${totalSuara} SUARA`;

    // 6. Update Elemen HTML - Kotak Kosong
    const elPersenKotak = document.getElementById('persen-kotak');
    const elSuaraKotak = document.getElementById('suara-kotak');
    if (elPersenKotak) elPersenKotak.textContent = `${persenKotak}%`;
    if (elSuaraKotak) elSuaraKotak.textContent = `${nilaiKotak} SUARA DARI ${totalSuara} TOTAL SUARA`;

  } catch (error) {
    console.error("Error Fetching Voting Results:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
      const menuToggle = document.getElementById("menu-toggle");
      const menuList = document.getElementById("menu-list");
      const iconOpen = document.getElementById("icon-open");
      const iconClose = document.getElementById("icon-close");

      if (menuToggle && menuList) {
        menuToggle.addEventListener("click", () => {
          menuList.classList.toggle("hidden");
          iconOpen.classList.toggle("hidden");
          iconClose.classList.toggle("hidden");
        });
      }
    });