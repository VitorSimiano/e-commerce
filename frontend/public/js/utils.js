
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
