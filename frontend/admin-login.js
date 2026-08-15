document.addEventListener('DOMContentLoaded', () => {
  
  const loginForm = document.getElementById('adminLoginForm');
  const errorElement = document.getElementById('error');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

        if (!res.ok) {
          throw new Error('Login gagal');
        }

        const data = await res.json();
        
        localStorage.setItem('admin_token', data.token); 
        
        window.location.href = 'admin.html';
        
      } catch(error) {
        console.error("Login Error:", error);
        if (errorElement) {
          errorElement.classList.remove('hidden');
        }
      }
    });
  } else {
    console.error("Form 'adminLoginForm' tidak ditemukan di HTML.");
  }
});