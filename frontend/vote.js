const container = document.getElementById('kandidatContainer');

const kandidatDummy = [
  { nama: "Kandidat 01", visi: "Visi misi calon 01...", jurusan: "Teknik Informatika", fotoUrl: "https://via.placeholder.com/150" },
  { nama: "Kandidat 02", visi: "Visi misi calon 02..." },
  { nama: "Kandidat 03", visi: "Visi misi calon 03..." }
];

kandidatDummy.forEach(k => {
  const card = document.createElement('div');
    // Menggunakan style kartu yang sudah kita sepakati
    card.className = 'bg-[#F0EFEB] rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105 border border-white/20';

  container.innerHTML += `
  <div class="bg-[#F0EFEB] rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105">
    
    <div class="w-32 h-32 md:w-40 md:h-40 mb-6 border-4 border-[#9448B0] rounded-full overflow-hidden shadow-lg bg-gray-200">
      <img src="${k.fotoUrl}" alt="${k.nama}" class="w-full h-full object-cover">
    </div>

    <h3 class="text-[#332277] text-2xl font-bold font-poppins mb-2">${k.nama}</h3>
    <p class="text-[#824589] font-poppins font-medium mb-6">${k.jurusan}</p>
    
    <button class="mt-auto w-full py-3 bg-gradient-to-r from-[#332277] to-[#9448B0] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
      Pilih
    </button>
  </div>
  `;
});

async function fetchCandidates() {
  const res = await fetch('/api/candidates', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  if (!res.ok) return alert('Gagal ambil kandidat');
  return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  const candidates = await fetchCandidates();
  const container = document.getElementById('kandidatContainer');

  // 🌟 Jika hanya dua kandidat, tampilkan di tengah secara fleksibel
  if (candidates.length === 2) {
    container.className = 'flex justify-center gap-8 flex-wrap z-10 px-6 w-full';
  } else {
    container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl px-6 w-full z-10';
  }

  candidates.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center space-y-4 border border-green-100 min-w-[260px] max-w-[300px]';

    card.innerHTML = `
      <img src="${c.foto_url}" alt="${c.nama}" 
           class="w-36 h-36 rounded-full object-cover border-4 border-green-600 shadow-md">
      <h2 class="text-xl font-bold text-green-700">${c.nama}</h2>
      <p class="text-sm text-gray-700 italic whitespace-pre-line break-words">
        ${c.visi}
      </p>
      <button 
        class="voteBtn bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-4 py-2 rounded-full w-full font-semibold transition-all duration-200" 
        data-id="${c.id}">
        Pilih Kandidat
      </button>
    `;
    container.appendChild(card);
  });

  // 🗳️ Aksi voting
  container.addEventListener('click', async e => {
    if (!e.target.matches('.voteBtn')) return;
    const candidate_id = e.target.dataset.id;
    if (!confirm('Yakin memilih kandidat ini?')) return;

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ candidate_id })
    });

    if (res.ok) {
      alert('Voting berhasil! Terima kasih sudah berpartisipasi.');
      window.location.href = 'thankyou.html';
    } else {
      const { message } = await res.json();
      alert('Gagal: ' + message);
    }
  });
});