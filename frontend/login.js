document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('userLoginForm');
  const errorElement = document.getElementById('error');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Menahan halaman agar tidak otomatis ter-refresh
      
      // Ambil input NIM dan Password teks biasa
      const nim = document.getElementById('nim').value;
      const password = document.getElementById('password').value;

      try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nim, password })
      });

        // Jika respons dari server gagal (misal NIM/Password salah)
        if (!res.ok) {
          throw new Error('NIM atau Password salah');
        }

        const data = await res.json();
        
        // Simpan token pemilih ke localStorage browser
        localStorage.setItem('user_token', data.token); 
        
        // Alihkan mahasiswa langsung ke halaman bilik suara
        window.location.href = 'vote.html'; 
        
      } catch(error) {
        console.error("Login Error:", error);
        // Tampilkan pesan error berwarna merah di layar
        if (errorElement) {
          errorElement.classList.remove('hidden');
        }
      }
    });
  }
});