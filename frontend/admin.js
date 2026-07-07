// Cek apakah admin sudah login
const token = localStorage.getItem('token');
if (!token) {
  alert('Anda harus login sebagai admin terlebih dahulu.');
  window.location.href = 'admin-login.html';
}

// Ambil data statistik dari server
async function fetchAdminStats() {
  const res = await fetch('/api/admin/stats', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) {
    alert('Gagal mengambil data statistik');
    return null;
  }
  return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  const stats = await fetchAdminStats();
  if (!stats) return;

  /**
   * Contoh struktur data API yang diharapkan:
   * {
   *   total_pemilih: 200,
   *   sudah_memilih: 150,
   *   kandidat: [
   *     { nama: "Ahmad", jumlah_suara: 80 },
   *     { nama: "Budi", jumlah_suara: 50 },
   *     { nama: "Citra", jumlah_suara: 20 }
   *   ]
   * }
   */

  // --- PIE CHART 1: Total Pemilih ---
  const ctx1 = document.getElementById('totalVoterChart').getContext('2d');
  const belum = stats.total_pemilih - stats.sudah_memilih;
  new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: ['Sudah Memilih', 'Belum Memilih'],
      datasets: [{
        data: [stats.sudah_memilih, belum],
        backgroundColor: ['#16a34a', '#facc15'],
        borderColor: ['#ffffff'],
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // --- PIE CHART 2: Suara Kandidat ---
  const ctx2 = document.getElementById('candidateChart').getContext('2d');
  new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: stats.kandidat.map(k => k.nama),
      datasets: [{
        data: stats.kandidat.map(k => k.jumlah_suara),
        backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
        borderColor: ['#ffffff'],
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // --- Logout ---
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'admin-login.html';
  });
});