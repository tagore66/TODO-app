const BASE_URL = ''; // Relative path since we serve public from same origin

// Switch between Login and Signup
document.getElementById('show-signup')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
  document.getElementById('auth-title').textContent = 'Create Account';
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('auth-title').textContent = 'Welcome Back';
});

// Local Login
document.getElementById('login-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard.html';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Something went wrong');
  }
});

// Signup
document.getElementById('signup-btn')?.addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard.html';
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    alert('Something went wrong');
  }
});

// Google Login
document.getElementById('google-login-btn')?.addEventListener('click', () => {
  window.location.href = '/auth/google';
});

// Check if already logged in
if (localStorage.getItem('token') && window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.location.href = '/dashboard.html';
}
