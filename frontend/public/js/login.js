const loginForm = document.getElementById('login-form');
const formAlert = document.getElementById('form-alert');
const submitButton = document.getElementById('submit-button');

// keeps ?redirect=... when moving between the login and register pages
document.getElementById('register-link').href = `/register.html${window.location.search}`;

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormErrors(loginForm, formAlert);

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    await AuthApi.login({
      email: loginForm.elements.email.value.trim(),
      password: loginForm.elements.password.value,
    });
    window.location.href = redirectTarget();
  } catch (error) {
    showFormErrors(loginForm, formAlert, error);
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});

// someone who is already logged in has nothing to do here
sessionReady.then((user) => {
  if (user) window.location.replace(redirectTarget());
});