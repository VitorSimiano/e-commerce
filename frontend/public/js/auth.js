let currentUser = null;


const sessionReady = (async () => {
  try {
    currentUser = await AuthApi.me();
  } catch (error) {
    currentUser = null;  
  }
  return currentUser;
})();


function redirectTarget() {
  const target = new URLSearchParams(window.location.search).get('redirect');
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/index.html';
}

function goToLogin() {
  const here = window.location.pathname + window.location.search;
  window.location.replace(`/login.html?redirect=${encodeURIComponent(here)}`);
}

async function requireAuth() {
  const user = await sessionReady;

  if (!user) {
    goToLogin();
    return null;
  }

  return user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;

  if (user.role !== 'admin') {
    window.location.replace('/index.html');
    return null;
  }

  return user;
}

async function logout() {
  try {
    await AuthApi.logout();
  } finally {
    currentUser = null;
    window.location.href = '/index.html';
  }
}