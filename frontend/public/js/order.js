
const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  order: document.getElementById('order'),
  title: document.getElementById('order-title'),
  date: document.getElementById('order-date'),
  status: document.getElementById('order-status'),
  items: document.getElementById('order-items'),
  total: document.getElementById('order-total'),
  shipping: document.getElementById('shipping-info'),
  description: document.getElementById('status-description'),
  pay: document.getElementById('pay-button'),
  cancel: document.getElementById('cancel-button'),
  message: document.getElementById('action-message'),
};

const STATUS_LABELS = {
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pago',
  cancelled: 'Cancelado',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

const STATUS_CLASSES = {
  awaiting_payment: 'text-bg-warning',
  paid: 'text-bg-success',
  cancelled: 'text-bg-danger',
  shipped: 'text-bg-info',
  delivered: 'text-bg-primary',
};

let currentOrder = null;

function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.order.classList.toggle('d-none', view !== 'order');
}

function formatDate(value) {
  if (!value) return 'Data não disponível';

  return new Date(value).toLocaleString('pt-BR');
}

function renderItems(items) {
  const rows = items.map((item) => {
    const row = el('tr');

    row.append(
      el('td', '', item.product_name),
      el('td', '', item.size),
      el('td', '', item.quantity),
      el('td', 'text-end', formatPrice(item.subtotal))
    );

    return row;
  });

  els.items.replaceChildren(...rows);
}


function renderShipping(shipping) {
  const get = (shortName, fullName) =>
    shipping[shortName] ?? shipping[fullName] ?? currentOrder[fullName] ?? '';

  const lines = [
    get('name', 'shipping_name'),
    `${get('address', 'shipping_address')}, ${get('number', 'shipping_number')}`,
    get('complement', 'shipping_complement'),
    get('neighborhood', 'shipping_neighborhood'),
    `${get('city', 'shipping_city')} - ${get('state', 'shipping_state')}`,
    `CEP: ${get('postal_code', 'shipping_postal_code')}`,
    `Telefone: ${get('phone', 'shipping_phone')}`,
  ].filter(Boolean);

  els.shipping.replaceChildren(
    ...lines.map((line) => el('p', 'mb-1', line))
  );
}


function renderActions(order) {
  const awaitingPayment = order.status === 'awaiting_payment';

  els.pay.classList.toggle('d-none', !awaitingPayment);
  els.cancel.classList.toggle('d-none', !awaitingPayment);

  const descriptions = {
    awaiting_payment: 'Seu pedido está aguardando a confirmação do pagamento.',
    paid: 'O pagamento deste pedido foi confirmado.',
    cancelled: 'Este pedido foi cancelado.',
    shipped: 'Seu pedido foi enviado.',
    delivered: 'Seu pedido foi entregue.',
  };

  els.description.textContent =
    descriptions[order.status] || 'Consulte o status do seu pedido.';
}

function renderOrder(order) {
  currentOrder = order;

  els.title.textContent = `Pedido #${order.id}`;
  els.date.textContent = `Criado em ${formatDate(order.created_at)}`;

  els.status.textContent =
    STATUS_LABELS[order.status] || order.status;

  els.status.className =
    `badge fs-6 ${STATUS_CLASSES[order.status] || 'text-bg-secondary'}`;

  els.total.textContent = formatPrice(order.total);

  renderItems(order.items || []);
  renderShipping(order.shipping || {});
  renderActions(order);

  showView('order');
}

async function loadOrder() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id || !/^\d+$/.test(id)) {
    els.error.textContent = 'ID de pedido inválido.';
    els.error.classList.remove('d-none');
    showView('none');
    return;
  }

  showView('loading');

  try {
    const order = await OrderApi.show(id);
    renderOrder(order);
  } catch (error) {
    console.error(error);

    els.error.textContent = error.response?.status === 404
      ? 'Pedido não encontrado.'
      : errorMessage(error);

    els.error.classList.remove('d-none');
    showView('none');
  }
}

async function runOrderAction(action, confirmation, button, originalText) {
  if (!currentOrder) return;

  if (!window.confirm(confirmation)) return;

  button.disabled = true;
  button.textContent = 'Aguarde...';
  els.message.classList.add('d-none');

  try {
    await action(currentOrder.id);
    const updatedOrder = await OrderApi.show(currentOrder.id);
    renderOrder(updatedOrder);

    els.message.textContent = 'Pedido atualizado com sucesso.';
    els.message.className = 'alert alert-success mt-3 mb-0';
  } catch (error) {
    console.error(error);

    els.message.textContent = error.response?.status === 422
      ? 'Essa operação não é permitida para o status atual do pedido.'
      : errorMessage(error);

    els.message.className = 'alert alert-danger mt-3 mb-0';

    button.disabled = false;
    button.textContent = originalText;
  }
}

els.pay.addEventListener('click', () => {
  runOrderAction(
    OrderApi.pay,
    'Deseja confirmar o pagamento simulado deste pedido?',
    els.pay,
    'Confirmar pagamento simulado'
  );
});

els.cancel.addEventListener('click', () => {
  runOrderAction(
    OrderApi.cancel,
    'Deseja realmente cancelar este pedido? O estoque será devolvido.',
    els.cancel,
    'Cancelar pedido'
  );
});

async function init() {
  const user = await requireAuth();
  if (!user) return;

  await loadOrder();
}

init();
