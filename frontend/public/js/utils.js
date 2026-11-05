
function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function errorMessage(error) {
    console.error(error);
  if (error.response) {
    if (error.response.status === 422) {
      return 'Algum filtro é inválido. Ajuste e tente novamente.';
    }
    return `Não foi possível carregar os dados (erro ${error.response.status}).`;
  }
  return 'Não foi possível conectar à API. Verifique se o servidor está no ar.';
}

// The API answers validation errors in English; these are the ones the forms can produce
const ERROR_TRANSLATIONS = [
  [/has already been taken/i, 'Este e-mail já está cadastrado.'],
  [/do not match our records/i, 'E-mail ou senha inválidos.'],
  [/confirmation does not match/i, 'A confirmação da senha não confere.'],
  [/at least 8 characters/i, 'A senha precisa ter pelo menos 8 caracteres.'],
  [/must be a valid email/i, 'Informe um e-mail válido.'],
  [/field is required/i, 'Campo obrigatório.'],
];

function translateError(message) {
  const match = ERROR_TRANSLATIONS.find(([pattern]) => pattern.test(message));
  return match ? match[1] : message;
}

function clearFormErrors(form, alertBox) {
  form.querySelectorAll('.is-invalid').forEach((input) => input.classList.remove('is-invalid'));
  alertBox.classList.add('d-none');
}

// 422: each message goes under its own field. Anything else goes to the alert box
function showFormErrors(form, alertBox, error) {
  const response = error.response;
  let message = null;

  if (response && response.status === 422 && response.data && response.data.errors) {
    let shownUnderField = false;

    Object.entries(response.data.errors).forEach(([field, messages]) => {
      const input = form.elements[field];
      const feedback = form.querySelector(`[data-feedback="${field}"]`);

      if (input && feedback) {
        input.classList.add('is-invalid');
        feedback.textContent = translateError(messages[0]);
        shownUnderField = true;
      }
    });

    if (shownUnderField) return;
    message = translateError(Object.values(response.data.errors)[0][0]);
  } else if (response && response.status === 429) {
    message = 'Muitas tentativas. Aguarde um minuto e tente novamente.';
  } else if (response && response.status === 419) {
    message = 'Sua sessão expirou. Recarregue a página e tente de novo.';
  } else {
    message = errorMessage(error);
  }

  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

// A message to show on the NEXT page (it survives the redirect after login)
const FLASH_KEY = 'flash_message';

function setFlash(type, messages) {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, messages }));
}

function showFlash() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return;
  sessionStorage.removeItem(FLASH_KEY);  

  const main = document.querySelector('main');
  if (!main) return;

  const { type, messages } = JSON.parse(raw);
  const box = el('div', `alert alert-${type} alert-dismissible fade show`);
  box.setAttribute('role', 'status');

  messages.forEach((message) => box.appendChild(el('div', '', message)));

  const close = el('button', 'btn-close');
  close.type = 'button';
  close.setAttribute('data-bs-dismiss', 'alert');
  close.setAttribute('aria-label', 'Fechar');
  box.appendChild(close);

  main.prepend(box);
}


function describeAdjustment(item) {
  const name = `${item.product} (${item.size})`;

  return item.type === 'unavailable'
    ? `${name} não está mais disponível e não foi para o seu carrinho.`
    : `${name}: a quantidade foi ajustada para ${item.quantity}, o máximo disponível em estoque.`;
}