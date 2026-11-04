let currentUser = null;

// Resolved once the server has answered "who am I?". Pages wait for it with `await sessionReady`
const sessionReady = (async () => {
  try {
    currentUser = await AuthApi.me();
  } catch (error) {
    currentUser = null;   // 401: nobody is logged in (or the API is unreachable)
  }
  return currentUser;
})();

// Where to go after logging in. Only paths inside this site are accepted (no open redirect)
function redirectTarget() {
  const target = new URLSearchParams(window.location.search).get('redirect');
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/index.html';
}

function goToLogin() {
  const here = window.location.pathname + window.location.search;
  window.location.replace(`/login.html?redirect=${encodeURIComponent(here)}`);
}

// For pages that need a login: `const user = await requireAuth(); if (!user) return;`
async function requireAuth() {
  const user = await sessionReady;

  if (!user) {
    goToLogin();
    return null;
  }

  return user;
}

// Hiding things from non-admins is only a convenience: the real barrier is the 403 from the server
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