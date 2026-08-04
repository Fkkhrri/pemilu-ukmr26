// Tunggu sampai seluruh HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  
  const loginForm = document.getElementById('adminLoginForm');
  const errorElement = document.getElementById('error');

  // Pastikan form ditemukan sebelum menambahkan event listener
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Mencegah halaman ter-refresh otomatis!
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        // Mengirim data ke backend lokal Anda
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

        // Jika backend merespon error (misal: password salah)
        if (!res.ok) {
          throw new Error('Login gagal');
        }

        // Jika sukses, ambil token dari backend
        const data = await res.json();
        
        // Simpan token ke memori browser
        localStorage.setItem('admin_token', data.token); 
        
        // Arahkan ke dashboard admin
        window.location.href = 'admin.html';
        
      } catch(error) {
        console.error("Login Error:", error);
        // Munculkan tulisan merah di bawah form
        if (errorElement) {
          errorElement.classList.remove('hidden');
        }
      }
    });
  } else {
    console.error("Form 'adminLoginForm' tidak ditemukan di HTML.");
  }
});