const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  notice: document.getElementById('notice'),
  empty: document.getElementById('empty'),
  cart: document.getElementById('cart'),
  body: document.getElementById('cart-body'),
  count: document.getElementById('cart-count'),
  total: document.getElementById('cart-total'),
};

function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.empty.classList.toggle('d-none', view !== 'empty');
  els.cart.classList.toggle('d-none', view !== 'cart');
}

function showNotice(message) {
  els.notice.textContent = message;
  els.notice.classList.remove('d-none');
}

function hideNotice() {
  els.notice.classList.add('d-none');
}

function createRow(item) {

  const row = el('tr', item.available ? '' : 'table-warning');

  const productCell = el('td');
  const link = el('a', 'fw-semibold text-decoration-none', item.product.name);
  link.href = `/product.html?id=${item.product.id}`;
  productCell.append(link, el('div', 'text-muted small', item.product.team));

  if (!item.available) {
    const note = item.stock > 0 && item.stock < item.quantity
      ? `Estoque insuficiente: só há ${item.stock} unidade(s).`
      : 'Indisponível no momento.';
    productCell.appendChild(el('div', 'text-danger small', note));
  }

  const input = el('input', 'form-control form-control-sm');
  input.type = 'number';
  input.min = 1;
  if (item.stock > 0) input.max = item.stock;
  input.value = item.quantity;
  input.setAttribute('aria-label', `Quantidade de ${item.product.name}`);
  input.addEventListener('change', () => changeQuantity(item, input));
  const quantityCell = el('td');
  quantityCell.appendChild(input);

  const removeButton = el('button', 'btn btn-outline-danger btn-sm', 'Remover');
  removeButton.type = 'button';
  removeButton.addEventListener('click', () => run(() => CartApi.removeItem(item.id)));
  const actionCell = el('td', 'text-end');
  actionCell.appendChild(removeButton);

  row.append(
    productCell,
    el('td', '', item.size),
    el('td', 'text-end', formatPrice(item.unit_price)),
    quantityCell,
    el('td', 'text-end fw-semibold', formatPrice(item.subtotal)),
    actionCell,
  );

  return row;
}


function render(cart) {
  setCartBadge(cart.total_items);

  if (cart.items.length === 0) {
    showView('empty');
    return;
  }

  els.body.replaceChildren(...cart.items.map(createRow));
  els.count.textContent = cart.total_items;
  els.total.textContent = formatPrice(cart.total);
  showView('cart');
}

async function load() {
  showView('loading');
  els.error.classList.add('d-none');

  try {
    render(await CartApi.get());
  } catch (error) {
    console.error(error);
    els.error.textContent = errorMessage(error);
    els.error.classList.remove('d-none');
    showView('none');
  }
}

function lockControls() {
  els.body.querySelectorAll('input, button').forEach((control) => {
    control.disabled = true;
  });
}

async function run(action) {
  hideNotice();
  lockControls();

  try {
    render(await action());
  } catch (error) {
    console.error(error);

    if (error.response && error.response.status === 422) {
      showNotice('Essa quantidade passa do estoque disponível desse tamanho. O carrinho foi atualizado com os valores reais.');
    } else if (error.response && error.response.status === 404) {
      showNotice('Esse item não está mais no carrinho.');
    } else {
      showNotice(errorMessage(error));
    }

    await load();
  }
}

function changeQuantity(item, input) {
  const value = Math.floor(Number(input.value));

  if (!Number.isFinite(value) || value < 1) {
    input.value = item.quantity;
    return;
  }

  if (value === item.quantity) return;

  run(() => CartApi.updateItem(item.id, value));
}

load();