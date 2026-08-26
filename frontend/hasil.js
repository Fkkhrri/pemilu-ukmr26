document.addEventListener("DOMContentLoaded", () => {
  const targetWaktuBuka = new Date(2026, 7, 28, 6, 0, 0).getTime();

  const envelopeTitle = document.getElementById("envelope-title");
  const envelopeSubtitle = document.getElementById("envelope-subtitle");
  const envelopeFlap = document.getElementById("envelope-flap");
  const envelopeLetter = document.getElementById("envelope-letter");
  const countdownBox = document.getElementById("countdown-box");
  const countdownTimer = document.getElementById("countdown-timer");

  if (envelopeFlap) envelopeFlap.style.animation = "none";
  if (envelopeLetter) envelopeLetter.style.animation = "none";

  const sekarang = new Date().getTime();

  if (sekarang < targetWaktuBuka) {
    if (envelopeTitle) envelopeTitle.textContent = "Pengumuman Hasil Pemilu";
    if (envelopeSubtitle) envelopeSubtitle.textContent = "Hasil pemilihan belum dapat dibuka.";
    if (countdownBox) {
      countdownBox.classList.remove("hidden");
      countdownBox.classList.add("flex");
    }
    const timerInterval = setInterval(() => {
      const current = new Date().getTime();
      const sisaWaktu = targetWaktuBuka - current;

      if (sisaWaktu <= 0) {
        clearInterval(timerInterval);
        location.reload();
        return;
      }

      const days = Math.floor(sisaWaktu / (1000 * 60 * 60 * 24));
      const hours = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((sisaWaktu % (1000 * 60)) / 1000);

      if (countdownTimer) {
        countdownTimer.textContent = `${padZero(days)}d : ${padZero(hours)}h : ${padZero(minutes)}m : ${padZero(seconds)}s`;
      }
    }, 1000);

  } else {
    jalankanProsesBukaHasil();
  }

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

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

async function jalankanProsesBukaHasil() {
  const envelopeScreen = document.getElementById("envelope-screen");
  const mainContent = document.getElementById("main-content");
  const envelopeFlap = document.getElementById("envelope-flap");
  const envelopeLetter = document.getElementById("envelope-letter");

  if (envelopeFlap) envelopeFlap.style.animation = "openFlap 1s 0.5s forwards";
  if (envelopeLetter) envelopeLetter.style.animation = "pullLetter 1.5s 1.2s forwards";

  await fetchHasilVotingFromBackend();

  setTimeout(() => {
    if (envelopeScreen) envelopeScreen.classList.add("fade-out");
    
    setTimeout(() => {
      if (envelopeScreen) envelopeScreen.style.display = "none";
      if (mainContent) {
        mainContent.classList.remove("hidden");
        mainContent.classList.add("flex");
        mainContent.classList.add("fade-in");
      }
    }, 1000);
  }, 3500);
}

async function fetchHasilVotingFromBackend() {
  try {
    const res = await fetch('/api/public/results');
    if (!res.ok) throw new Error('Gagal memuat hasil dari server');
    
    const data = await res.json();

    const totalSuara = parseFloat(data.total_suara || 0);
    const khairulData = data.kandidat?.find(k => k.id === 1 || (k.nama && k.nama.toLowerCase().includes("khairul"))) || {};
    const kotakKosongData = data.kandidat?.find(k => k.id === 4 || (k.nama && k.nama.toLowerCase().includes("kotak"))) || {};

    const nilaiKhairul = parseFloat(khairulData.total_bobot ?? khairulData.suara ?? 0);
    const nilaiKotak = parseFloat(kotakKosongData.total_bobot ?? kotakKosongData.suara ?? 0);

    const persenKhairul = totalSuara > 0 ? ((nilaiKhairul / totalSuara) * 100).toFixed(1) : "0.0";
    const persenKotak = totalSuara > 0 ? ((nilaiKotak / totalSuara) * 100).toFixed(1) : "0.0";

    const elPersen2 = document.getElementById('persen-2');
    const elSuara2 = document.getElementById('suara-2');
    if (elPersen2) elPersen2.textContent = `${persenKhairul}%`;
    if (elSuara2) elSuara2.textContent = `${nilaiKhairul} DARI ${totalSuara} SUARA`;

    const elPersenKotak = document.getElementById('persen-kotak');
    const elSuaraKotak = document.getElementById('suara-kotak');
    if (elPersenKotak) elPersenKotak.textContent = `${persenKotak}%`;
    if (elSuaraKotak) elSuaraKotak.textContent = `${nilaiKotak} SUARA DARI ${totalSuara} TOTAL SUARA`;

  } catch (error) {
    console.error("Error Fetching Voting Results:", error);
  }
}