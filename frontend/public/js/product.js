const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  product: document.getElementById('product'),
  category: document.getElementById('p-category'),
  name: document.getElementById('p-name'),
  team: document.getElementById('p-team'),
  price: document.getElementById('p-price'),
   image: document.getElementById('p-image'),
  description: document.getElementById('p-description'),
  availability: document.getElementById('p-availability'),
  sizes: document.getElementById('p-sizes'),
  quantity: document.getElementById('p-quantity'),
  stockInfo: document.getElementById('p-stock-info'),
  addButton: document.getElementById('add-to-cart'),
  feedback: document.getElementById('cart-feedback'),
};

const SIZE_ORDER = ['P', 'M', 'G', 'GG'];

function imageUrl(path) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '');
  return `${API_ORIGIN}/storage/${cleanPath}`;
}

let selectedVariant = null;

function showError(message) {
  els.loading.classList.add('d-none');
  els.product.classList.add('d-none');
  els.error.textContent = message;
  els.error.classList.remove('d-none');
}

function showFeedback(type, message, withCartLink = false) {
  els.feedback.className = `alert alert-${type} mt-3`;
  els.feedback.replaceChildren(document.createTextNode(message));

  if (withCartLink) {
    const link = el('a', 'alert-link ms-2', 'Ver carrinho');
    link.href = '/cart.html';
    els.feedback.appendChild(link);
  }
}

function hideFeedback() {
  els.feedback.className = 'd-none';
}

function readQuantity() {
  const max = Number(els.quantity.max) || 1;
  const value = Math.floor(Number(els.quantity.value)) || 1;
  const quantity = Math.min(Math.max(value, 1), max);
  els.quantity.value = quantity;
  return quantity;
}

function selectVariant(variant) {
  selectedVariant = variant;
  hideFeedback();

  els.quantity.disabled = false;
  els.quantity.max = variant.stock;
  els.quantity.value = 1;
  els.stockInfo.textContent = `${variant.stock} unidade(s) disponível(is) no tamanho ${variant.size}`;
  els.addButton.disabled = false;
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
    if (product.image) {
    const img = el('img', 'img-fluid w-100 h-100 object-fit-contain rounded');

    img.src = imageUrl(product.image);
    img.alt = product.name;

    img.onerror = () => {
      els.image.textContent = '👕';
    };

    els.image.replaceChildren(img);
  }
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

  if (!product.in_stock) {
    els.addButton.textContent = 'Produto esgotado';
    els.stockInfo.textContent = 'Este produto está esgotado.';
  }

  els.loading.classList.add('d-none');
  els.product.classList.remove('d-none');
}

async function addToCart() {
  if (!selectedVariant) return;

  const quantity = readQuantity();
  els.addButton.disabled = true;
  hideFeedback();

  try {
    const cart = await CartApi.addItem(selectedVariant.id, quantity);
    setCartBadge(cart.total_items);
    showFeedback('success', `${quantity} item(ns) adicionado(s) ao carrinho.`, true);
  } catch (error) {
    console.error(error);

    if (error.response && error.response.status === 422) {
      showFeedback(
        'warning',
        'Não foi possível adicionar: a quantidade, somada ao que já está no seu carrinho, passa do estoque disponível.',
      );
    } else {
      showFeedback('danger', errorMessage(error));
    }
  } finally {
    els.addButton.disabled = false;
  }
}

els.quantity.addEventListener('change', readQuantity);
els.addButton.addEventListener('click', addToCart);

async function init() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id || !/^\d+$/.test(id)) {
    showError('Produto não encontrado.');
    return;
  }

  try {
    renderProduct(await CatalogApi.product(id));
  } catch (error) {
    console.error(error);

    if (error.response && error.response.status === 404) {
      showError('Produto não encontrado.');
    } else {
      showError(errorMessage(error));
    }
  }
}

init();