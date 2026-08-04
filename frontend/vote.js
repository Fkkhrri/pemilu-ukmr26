// === KONFIGURASI WAKTU PEMILU ===
// Sesuaikan dengan jadwal asli Pemilu UKMR 2026 Anda
const WAKTU_MULAI = new Date('2026-08-03T00:00:00').getTime();
const WAKTU_SELESAI = new Date('2026-08-04T23:59:59').getTime(); // Contoh: Berakhir jam 5 sore

async function fetchCandidates() {
  const token = localStorage.getItem('user_token'); // Menyesuaikan token pemilih mahasiswa Anda sebelumnya
  
  try {
    const res = await fetch('http://localhost:3000/api/candidates', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Gagal ambil data');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderCandidates(candidates) {
  const container = document.getElementById('kandidatContainer');
  container.innerHTML = ''; // Bersihkan container terlebih dahulu

  candidates.sort((a, b) => a.id - b.id);

  // Atur layout grid/flex
  if (candidates.length === 2) {
    container.className = 'flex justify-center gap-8 flex-wrap z-10 px-6 w-full';
  } else {
    container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl px-6 w-full z-10';
  }

  candidates.forEach(c => {
    const card = document.createElement('div');

    // ==========================================
    // 1. JIKA KANDIDAT ADALAH KOTAK KOSONG (ID = 4)
    // ==========================================
    if (c.id === 4 || (c.nama && c.nama.toLowerCase().includes('kotak'))) {
      // Tambahkan min-h-[350px] agar tinggi kartunya tetap seimbang dengan kartu Khairul
      card.className = 'bg-white rounded-[40px] p-8 shadow-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 mt-8 w-[300px] md:w-[350px] min-h-[350px]';
      
      card.innerHTML = `
        <!-- WAPPER KONTEN TENGAH (Rapi di Mobile & PC) -->
        <div class="flex-1 flex flex-col items-center justify-center w-full my-auto">
          <h3 class="text-[#332277] text-2xl md:text-3xl font-black font-poppins uppercase tracking-wider text-center">
            Kotak Kosong
          </h3>
          
          <!-- SUBTEKS DESKRIPSI -->
          <p class="text-[#824589] font-poppins text-xs md:text-sm font-medium mt-3 text-center px-2">
            Pilihan ini tetap dihitung sebagai partisipasi aktif dalam pemilu.
          </p>
        </div>
        
        <!-- TOMBOL PILIH -->
        <button class="voteBtn w-full py-3 bg-gradient-to-r from-[#332277] to-[#9448B0] text-white rounded-full font-bold hover:opacity-90 transition-opacity" data-id="${c.id}">
          Pilih
        </button>
      `;
    } 
    // ==========================================
    // 2. JIKA KANDIDAT NORMAL (KHAIRUL DLL)
    // ==========================================
    else {
      card.className = 'bg-[#F0EFEB] rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105 border border-white/20 mt-8 w-[300px] md:w-[350px]';
      
      card.innerHTML = `
        <div class="w-32 h-32 md:w-40 md:h-40 mb-8 border-4 border-[#9448B0] rounded-full overflow-hidden shadow-lg bg-gray-200">
          <img src="${c.foto_url || 'images/IMG_7093.JPG'}" alt="${c.nama}" class="w-full h-full object-cover">
        </div>

        <h3 class="text-[#332277] text-2xl font-bold font-poppins mb-2">${c.nama}</h3>
        <p class="text-[#824589] font-poppins font-medium mb-4 whitespace-pre-line break-words">${c.visi || 'Melanjutkan Perubahan'}</p>
        
        <button class="voteBtn mt-auto w-full py-3 bg-gradient-to-r from-[#332277] to-[#9448B0] text-white rounded-full font-bold hover:opacity-90 transition-opacity" data-id="${c.id}">
          Pilih
        </button>
      `;
    }

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('kandidatContainer');
  let candidatesData = [];
  let isRendered = false;

  // Cek berkala kondisi waktu setiap 1 detik
  setInterval(async () => {
    const sekarang = new Date().getTime();

    // Kondisi 1: Masih Masa Tunggu / Countdown Mulai
    if (sekarang < WAKTU_MULAI) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-[#F0EFEB] text-xl font-poppins font-semibold bg-[#332277]/40 px-6 py-3 rounded-2xl inline-block">
            Kotak suara belum dibuka. Silakan tunggu hingga waktu hitung mundur selesai.
          </p>
        </div>`;
      isRendered = false;
    } 
    // Kondisi 2: Masa Voting Berlangsung
    else if (sekarang >= WAKTU_MULAI && sekarang <= WAKTU_SELESAI) {
      // Pastikan innerHTML HANYA dieksekusi sekali di awal
      if (!isRendered) { 
        container.innerHTML = `
          <div class="col-span-full text-center py-12">
            <p class="text-[#F0EFEB] text-xl font-poppins font-semibold bg-[#DF9DC9]/40 px-6 py-3 rounded-2xl inline-block animate-pulse">
              Memuat data kandidat dari server...
            </p>
          </div>`;
          
        // Ambil data dari backend hanya saat gerbang voting baru terbuka
        fetchCandidates().then(data => {
            renderCandidates(data);
        });
        isRendered = true; 
      }
    }
    // Kondisi 3: Waktu Voting Habis
    else {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-red-300 text-xl font-poppins font-semibold bg-red-900/40 px-6 py-3 rounded-2xl inline-block">
            Waktu pemilihan telah resmi berakhir. Kotak suara ditutup.
          </p>
        </div>`;
      isRendered = false;
    }
  }, 1000);

  // === Aksi Kirim Suara (Voting) ===
  container.addEventListener('click', async e => {
    if (!e.target.matches('.voteBtn')) return;
    
    // PARSE MENJADI INTEGER (Angka)
    const candidate_id = parseInt(e.target.dataset.id, 10);
    
    if (isNaN(candidate_id)) {
      alert('ID Kandidat tidak valid!');
      return;
    }

    if (!confirm('Yakin memilih kandidat ini? Pilihan Anda tidak dapat diubah kembali.')) return;

    const token = localStorage.getItem('user_token');

    try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nim, password })
    });

      if (res.ok) {
        alert('Voting berhasil! Terima kasih sudah berpartisipasi.');
        window.location.href = 'thankyou.html';
      } else {
        const { message } = await res.json();
        alert('Gagal: ' + message);
      }
    } catch (err) {
      console.error("Error Network:", err);
      alert('Terjadi kesalahan jaringan.');
    }
  });
});