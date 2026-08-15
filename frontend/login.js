document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('userLoginForm');
  const errorElement = document.getElementById('error');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
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

        if (!res.ok) {
          throw new Error('NIM atau Password salah');
        }

        const data = await res.json();
        
        localStorage.setItem('user_token', data.token); 
        
        window.location.href = 'vote.html'; 
        
      } catch(error) {
        console.error("Login Error:", error);
        if (errorElement) {
          errorElement.classList.remove('hidden');
        }
      }
    });
  }
});