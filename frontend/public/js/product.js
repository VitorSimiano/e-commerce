const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  product: document.getElementById('product'),
  category: document.getElementById('p-category'),
  name: document.getElementById('p-name'),
  team: document.getElementById('p-team'),
  price: document.getElementById('p-price'),
  description: document.getElementById('p-description'),
  availability: document.getElementById('p-availability'),
  sizes: document.getElementById('p-sizes'),
  quantity: document.getElementById('p-quantity'),
  stockInfo: document.getElementById('p-stock-info'),
};

const SIZE_ORDER = ['P', 'M', 'G', 'GG'];

function showError(message) {
  els.loading.classList.add('d-none');
  els.product.classList.add('d-none');
  els.error.textContent = message;
  els.error.classList.remove('d-none');
}


function selectVariant(variant) {
  els.quantity.disabled = false;
  els.quantity.max = variant.stock;
  els.quantity.value = 1;
  els.stockInfo.textContent = `${variant.stock} unidade(s) disponível(is) no tamanho ${variant.size}`;
}

function renderSizes(variants) {
  const sorted = [...variants].sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));

  const nodes = sorted.map((variant) => {
    const wrapper = el('div');


    const input = el('input', 'btn-check');
    input.type = 'radio';
    input.name = 'size';
    input.id = `size-${variant.size}`;
    input.disabled = variant.stock === 0;
    input.addEventListener('change', () => selectVariant(variant));

    const label = el('label', 'btn btn-outline-dark', variant.stock === 0 ? `${variant.size} (esgotado)` : variant.size);
    label.htmlFor = input.id;

    wrapper.append(input, label);
    return wrapper;
  });

  els.sizes.replaceChildren(...nodes);
}

function renderProduct(product) {
  document.title = `${product.name} | Loja de Camisas`;
  els.category.textContent = `${product.category.flag} ${product.category.name} · ${product.category.league}`;
  els.name.textContent = product.name;
  els.team.textContent = `${product.team} · ${product.season}`;
  els.price.textContent = formatPrice(product.price);
  els.description.textContent = product.description || '';

  els.availability.replaceChildren(
    product.in_stock
      ? el('span', 'badge text-bg-success', 'Em estoque')
      : el('span', 'badge text-bg-secondary', 'Esgotado'),
  );

  renderSizes(product.variants);

  els.loading.classList.add('d-none');
  els.product.classList.remove('d-none');
}

els.quantity.addEventListener('change', () => {
  const max = Number(els.quantity.max);
  const value = Math.floor(Number(els.quantity.value)) || 1;
  els.quantity.value = Math.min(Math.max(value, 1), max);
});

async function init() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id || !/^\d+$/.test(id)) {
    showError('Produto não encontrado.');
    return;
  }

  try {
    renderProduct(await CatalogApi.product(id));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showError('Produto não encontrado.');
    } else {
      showError(errorMessage(error));
    }
  }
}

init();