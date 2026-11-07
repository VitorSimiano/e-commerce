
const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  empty: document.getElementById('empty'),
  orders: document.getElementById('orders'),
  list: document.getElementById('orders-list'),
  previous: document.getElementById('previous'),
  next: document.getElementById('next'),
  paginationInfo: document.getElementById('pagination-info'),
};

let currentOrdersPage = 1;
let lastPage = 1;

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

function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.empty.classList.toggle('d-none', view !== 'empty');
  els.orders.classList.toggle('d-none', view !== 'orders');
}

function formatDate(value) {
  if (!value) return 'Data não disponível';

  return new Date(value).toLocaleString('pt-BR');
}

function createOrderCard(order) {
  const column = el('div', 'col-12');

  const card = el('div', 'card');
  const body = el('div', 'card-body');

  const header = el('div', 'd-flex justify-content-between align-items-start flex-wrap gap-2');

  const title = el('h2', 'h5 mb-1', `Pedido #${order.id}`);
  const status = el(
    'span',
    `badge ${STATUS_CLASSES[order.status] || 'text-bg-secondary'}`,
    STATUS_LABELS[order.status] || order.status
  );

  header.append(title, status);

  body.append(
    header,
    el('p', 'text-muted small mt-2 mb-2', `Realizado em ${formatDate(order.created_at)}`),
    el('p', 'mb-3', `Total: ${formatPrice(order.total)}`)
  );

  const link = el('a', 'btn btn-outline-primary btn-sm', 'Ver detalhes');
  link.href = `/order.html?id=${order.id}`;

  body.appendChild(link);
  card.appendChild(body);
  column.appendChild(card);

  return column;
}

async function loadOrders() {
  showView('loading');
  els.error.classList.add('d-none');

  try {
    const result = await OrderApi.list(currentOrdersPage);
    const orders = result.data || [];

    if (orders.length === 0 && currentOrdersPage === 1) {
      showView('empty');
      return;
    }

    lastPage = result.meta?.last_page || 1;

    els.list.replaceChildren(...orders.map(createOrderCard));

    els.paginationInfo.textContent =
      `Página ${currentOrdersPage} de ${lastPage}`;

    els.previous.disabled = currentOrdersPage <= 1;
    els.next.disabled = currentOrdersPage >= lastPage;

    showView('orders');
  } catch (error) {
    console.error(error);
    els.error.textContent = errorMessage(error);
    els.error.classList.remove('d-none');
    showView('none');
  }
}

els.previous.addEventListener('click', () => {
  if (currentOrdersPage > 1) {
    currentOrdersPage--;
    loadOrders();
  }
});

els.next.addEventListener('click', () => {
  if (currentOrdersPage < lastPage) {
    currentOrdersPage++;
    loadOrders();
  }
});

async function init() {
  const user = await requireAuth();
  if (!user) return;

  await loadOrders();
}

init();
