const BASE_URL = '';
document.getElementById('show-signup')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
  document.getElementById('auth-title').textContent = 'Create Account';
  document.getElementById('auth-subtitle').textContent = 'Join us to stay productive';
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('auth-title').textContent = 'Welcome Back';
  document.getElementById('auth-subtitle').textContent = 'Sign in to manage your tasks';
});


let mfaTempToken = null;

async function handleAuthResponse(data) {
  if (data.forceMfaSetup) {

    mfaTempToken = data.tempToken;
    document.getElementById('mfa-title').textContent = 'Secure Your Account';
    document.getElementById('mfa-subtitle').textContent = 'MFA is now mandatory. Scan this QR code to continue.';
    document.getElementById('verify-mfa-btn').textContent = 'Enable & Sign In';
    document.getElementById('mfa-setup-container').classList.remove('hidden');

    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('mfa-form').classList.remove('hidden');
    document.getElementById('auth-container').querySelector('.auth-header').classList.add('hidden');
    document.getElementById('mfa-otp').focus();


    try {
      const setupRes = await fetch(`${BASE_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken })
      });
      const setupData = await setupRes.json();

      if (setupRes.ok) {
        document.getElementById('setup-qr-img').src = setupData.qrCodeUrl;
      } else {
        alert('Failed to initialize MFA QR code');
      }
    } catch (err) {
      console.error('MFA Setup Error:', err);
    }
  } else if (data.mfaRequired) {

    mfaTempToken = data.tempToken;
    document.getElementById('mfa-setup-container').classList.add('hidden');
    document.getElementById('mfa-title').textContent = 'Verify OTP';
    document.getElementById('mfa-subtitle').textContent = 'Enter the 6-digit code from your Authenticator app';
    document.getElementById('verify-mfa-btn').textContent = 'Verify & Sign In';

    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('mfa-form').classList.remove('hidden');
    document.getElementById('auth-container').querySelector('.auth-header').classList.add('hidden');
    document.getElementById('mfa-otp').focus();
  } else {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  }
}

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
      handleAuthResponse(data);
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Something went wrong');
  }
});

document.getElementById('signup-btn')?.addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      handleAuthResponse(data);
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    alert('Something went wrong');
  }
});

document.getElementById('verify-mfa-btn')?.addEventListener('click', async () => {
  const otp = document.getElementById('mfa-otp').value.trim();
  if (!otp || otp.length !== 6) {
    alert('Please enter a valid 6-digit code');
    return;
  }

  const isSetup = !document.getElementById('mfa-setup-container').classList.contains('hidden');
  const endpoint = isSetup ? '/auth/mfa/verify-setup' : '/auth/mfa/verify';

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: mfaTempToken, token: otp })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard.html';
    } else {
      alert(data.message || 'Verification failed');
    }
  } catch (err) {
    alert('Verification failed. Please try again.');
  }
});

document.getElementById('mfa-otp')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('verify-mfa-btn').click();
});

document.getElementById('cancel-mfa')?.addEventListener('click', (e) => {
  e.preventDefault();
  mfaTempToken = null;
  document.getElementById('mfa-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('auth-container').querySelector('.auth-header').classList.remove('hidden');
  document.getElementById('auth-title').textContent = 'Welcome Back';
  document.getElementById('auth-subtitle').textContent = 'Sign in to manage your tasks';
  document.getElementById('mfa-otp').value = '';
});

document.getElementById('google-login-btn')?.addEventListener('click', () => {
  window.location.href = '/auth/google';
});

document.getElementById('google-signup-btn')?.addEventListener('click', () => {
  window.location.href = '/auth/google';
});


if (localStorage.getItem('token') && window.location.pathname === '/' || window.location.pathname === '/index.html') {
  window.location.href = '/dashboard.html';
}
