
const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  empty: document.getElementById('empty'),
  checkout: document.getElementById('checkout'),
  form: document.getElementById('checkout-form'),
  formError: document.getElementById('form-error'),
  items: document.getElementById('items'),
  count: document.getElementById('item-count'),
  total: document.getElementById('total'),
  button: document.getElementById('submit-button'),
};

function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.empty.classList.toggle('d-none', view !== 'empty');
  els.checkout.classList.toggle('d-none', view !== 'checkout');
}

function renderCart(cart) {
  if (!cart.items.length) {
    showView('empty');
    return;
  }

  const rows = cart.items.map((item) => {
    const row = el('div', 'd-flex justify-content-between gap-3 mb-3');

    const description = el('div');
    description.append(
      el('strong', '', item.product.name),
      el('div', 'text-muted small', `${item.product.team} • Tamanho ${item.size} • Qtd. ${item.quantity}`)
    );

    row.append(
      description,
      el('strong', 'text-nowrap', formatPrice(item.subtotal))
    );

    return row;
  });

  els.items.replaceChildren(...rows);
  els.count.textContent = cart.total_items;
  els.total.textContent = formatPrice(cart.total);

  showView('checkout');
}

async function loadCheckout() {
  const user = await requireAuth();
  if (!user) return;

  try {
    const cart = await CartApi.get();

    renderCart(cart);

    els.form.elements.shipping_name.value = user.name || '';
  } catch (error) {
    console.error(error);
    els.error.textContent = errorMessage(error);
    els.error.classList.remove('d-none');
    showView('none');
  }
}

function getShippingData() {
  return {
    shipping_name: els.form.elements.shipping_name.value.trim(),
    shipping_phone: els.form.elements.shipping_phone.value.trim(),
    shipping_postal_code: els.form.elements.shipping_postal_code.value.trim(),
    shipping_address: els.form.elements.shipping_address.value.trim(),
    shipping_number: els.form.elements.shipping_number.value.trim(),
    shipping_complement: els.form.elements.shipping_complement.value.trim(),
    shipping_neighborhood: els.form.elements.shipping_neighborhood.value.trim(),
    shipping_city: els.form.elements.shipping_city.value.trim(),
    shipping_state: els.form.elements.shipping_state.value.trim().toUpperCase(),
  };
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  els.formError.classList.add('d-none');
  els.button.disabled = true;
  els.button.textContent = 'Criando pedido...';

  try {
    const order = await OrderApi.create(getShippingData());

    window.location.href = `/order.html?id=${order.id}`;
  } catch (error) {
    console.error(error);

    let message = errorMessage(error);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;

      message = errors
        ? Object.values(errors).flat().join(' ')
        : 'Confira os dados e a disponibilidade dos produtos.';
    }

    els.formError.textContent = message;
    els.formError.classList.remove('d-none');

    els.button.disabled = false;
    els.button.textContent = 'Confirmar pedido';
  }
});

loadCheckout();
