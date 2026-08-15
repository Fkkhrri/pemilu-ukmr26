document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('admin_token');
  window.location.href = 'admin-login.html';
});

async function fetchAdminStats() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    alert('Anda harus login sebagai admin terlebih dahulu.');
    window.location.href = 'admin-login.html';
    return null;
  }

  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Gagal mengambil data statistik');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const stats = await fetchAdminStats();
  if (!stats) return;

  const ctx1 = document.getElementById('totalVoterChart')?.getContext('2d');
  if (ctx1) {
    const belum = stats.total_pemilih - stats.sudah_memilih;
    new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: ['Sudah Memilih', 'Belum Memilih'],
        datasets: [{
          data: [stats.sudah_memilih, belum],
          backgroundColor: ['#16a34a', '#facc15'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Poppins', size: 13, weight: '600' },
              color: '#332277',
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const fillStyle = data.datasets[0].backgroundColor[i];
                    return {
                      text: `${label}: ${value} orang`,
                      fillStyle: fillStyle,
                      strokeStyle: fillStyle,
                      lineWidth: 0,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          }
        }
      }
    });
  }

  const ctx2 = document.getElementById('candidateChart')?.getContext('2d');
  if (ctx2 && stats.kandidat) {
    
    const labelsList = stats.kandidat.map(k => k.nama);
    const suaraList = stats.kandidat.map(k => Number(k.suara || k.jumlah_suara || 0));

    const totalSuaraMasuk = suaraList.reduce((a, b) => a + b, 0);

    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: labelsList,
        datasets: [{
          data: totalSuaraMasuk === 0 ? labelsList.map(() => 0) : suaraList,
          backgroundColor: ['#332277', '#9448B0', '#E47CB8', '#D8F878'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Poppins', size: 14, weight: '600' },
              color: '#332277',
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = stats.kandidat[i] ? Number(stats.kandidat[i].suara || 0) : 0;
                    const fillStyle = data.datasets[0].backgroundColor[i % data.datasets[0].backgroundColor.length];
                    return {
                      text: `${label}: ${value} Suara`,
                      fillStyle: fillStyle,
                      strokeStyle: fillStyle,
                      lineWidth: 0,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          }
        }
      }
    });
  }
});