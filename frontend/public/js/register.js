const registerForm = document.getElementById('register-form');
const formAlert = document.getElementById('form-alert');
const submitButton = document.getElementById('submit-button');

document.getElementById('login-link').href = `/login.html${window.location.search}`;

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormErrors(registerForm, formAlert);

  submitButton.disabled = true;
  submitButton.textContent = 'Criando conta...';

  try {

    await AuthApi.register({
      name: registerForm.elements.name.value.trim(),
      email: registerForm.elements.email.value.trim(),
      password: registerForm.elements.password.value,
      password_confirmation: registerForm.elements.password_confirmation.value,
    });
    window.location.href = redirectTarget();
  } catch (error) {
    showFormErrors(registerForm, formAlert, error);
    submitButton.disabled = false;
    submitButton.textContent = 'Criar conta';
  }
});

sessionReady.then((user) => {
  if (user) window.location.replace(redirectTarget());
});