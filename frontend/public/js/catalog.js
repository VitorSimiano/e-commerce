const state = { search: '', category_id: '', size: '', sort: 'newest', page: 1 };

const els = {
  form: document.getElementById('filters-form'),
  search: document.getElementById('filter-search'),
  category: document.getElementById('filter-category'),
  size: document.getElementById('filter-size'),
  sort: document.getElementById('filter-sort'),
  clear: document.getElementById('filter-clear'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  empty: document.getElementById('empty'),
  summary: document.getElementById('summary'),
  grid: document.getElementById('grid'),
  pagination: document.getElementById('pagination'),
};


function imageUrl(path) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '');
  return `${API_ORIGIN}/storage/${cleanPath}`;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.search = params.get('search') || '';
  state.category_id = params.get('category_id') || '';
  state.size = params.get('size') || '';
  state.sort = params.get('sort') || 'newest';
  state.page = Number(params.get('page')) || 1;
}


function buildParams() {
  const params = {};
  if (state.search) params.search = state.search;
  if (state.category_id) params.category_id = state.category_id;
  if (state.size) params.size = state.size;
  if (state.sort !== 'newest') params.sort = state.sort;
  if (state.page > 1) params.page = state.page;
  return params;
}

function writeStateToUrl() {
  const query = new URLSearchParams(buildParams()).toString();
  history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

function syncControls() {
  els.search.value = state.search;
  els.category.value = state.category_id;
  els.size.value = state.size;
  els.sort.value = state.sort;
}


function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.error.classList.toggle('d-none', view !== 'error');
  els.empty.classList.toggle('d-none', view !== 'empty');
  els.grid.classList.toggle('d-none', view !== 'grid');
  els.summary.classList.toggle('d-none', view !== 'grid');
  els.pagination.classList.toggle('d-none', view !== 'grid');
}


function createCard(product) {
  const col = el('div', 'col');
  const card = el('div', 'card h-100 shadow-sm card-product');

 const imageContainer = el('div', 'ratio ratio-1x1 bg-light');

if (product.image) {
  const img = el('img', 'w-100 h-100 object-fit-contain');
  img.src = imageUrl(product.image);
  img.alt = product.name;

  img.onerror = () => {
    imageContainer.replaceChildren(
      el('div', 'd-flex align-items-center justify-content-center', '👕')
    );
  };

  imageContainer.appendChild(img);
} else {
  imageContainer.appendChild(
    el('div', 'd-flex align-items-center justify-content-center', '👕')
  );
}

card.appendChild(imageContainer);

  const body = el('div', 'card-body d-flex flex-column');
  body.appendChild(el('h2', 'h6 card-title', product.name));
  body.appendChild(el('p', 'text-muted small mb-2', `${product.category.flag} ${product.team} · ${product.season}`));
  body.appendChild(el('p', 'fw-bold fs-5 mb-2', formatPrice(product.price)));

  const sizes = product.variants
    .filter((variant) => variant.stock > 0)
    .map((variant) => variant.size)
    .join(' · ');

  if (sizes) {
    body.appendChild(el('p', 'small mb-2', `Tamanhos: ${sizes}`));
  }

  if (!product.in_stock) {
    body.appendChild(el('span', 'badge text-bg-secondary align-self-start mb-2', 'Esgotado'));
  }

  const link = el('a', 'btn btn-outline-primary mt-auto', 'Ver detalhes');
  link.href = `/product.html?id=${product.id}`;
  body.appendChild(link);

  card.appendChild(body);
  col.appendChild(card);

  return col;
}


function renderProducts(products) {
  els.grid.replaceChildren(...products.map(createCard));
}

function renderSummary(meta) {
  els.summary.textContent = `${meta.total} camisa(s) · página ${meta.current_page} de ${meta.last_page}`;
}

function pageItem(label, page, disabled, active = false) {
  const item = el('li', `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`);
  const button = el('button', 'page-link', label);
  button.type = 'button';
  button.disabled = disabled;
  button.addEventListener('click', () => goToPage(page));
  item.appendChild(button);
  return item;
}

function renderPagination(meta) {
  els.pagination.replaceChildren();
  if (meta.last_page <= 1) return;

  const list = el('ul', 'pagination justify-content-center flex-wrap');
  list.appendChild(pageItem('Anterior', meta.current_page - 1, meta.current_page === 1));
  for (let page = 1; page <= meta.last_page; page++) {
    list.appendChild(pageItem(String(page), page, false, page === meta.current_page));
  }
  list.appendChild(pageItem('Próxima', meta.current_page + 1, meta.current_page === meta.last_page));
  els.pagination.appendChild(list);
}


async function loadCategories() {
  const categories = await CatalogApi.categories();
  categories.forEach((category) => {
    const option = el('option', '', `${category.flag} ${category.name}`);
    option.value = category.id;
    els.category.appendChild(option);
  });
}

async function loadProducts() {
  showView('loading');
  writeStateToUrl();

  try {
    const { data: products, meta } = await CatalogApi.products(buildParams());

  
    if (products.length === 0 && state.page > 1) {
      state.page = 1;
      return loadProducts();
    }

    if (products.length === 0) {
      showView('empty');
      return;
    }

    renderProducts(products);
    renderSummary(meta);
    renderPagination(meta);
    showView('grid');
  } catch (error) {
    els.error.textContent = errorMessage(error);
    showView('error');
  }
}

function goToPage(page) {
  state.page = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  state.search = els.search.value.trim();
  state.page = 1; 
  loadProducts();
});

[['category', 'category_id'], ['size', 'size'], ['sort', 'sort']].forEach(([key, stateKey]) => {
  els[key].addEventListener('change', () => {
    state[stateKey] = els[key].value;
    state.page = 1;
    loadProducts();
  });
});

els.clear.addEventListener('click', () => {
  Object.assign(state, { search: '', category_id: '', size: '', sort: 'newest', page: 1 });
  syncControls();
  loadProducts();
});



async function init() {
  readStateFromUrl();
  try {
    await loadCategories();   
  } catch (error) {
    
  }
  syncControls();
  await loadProducts();
}

init();