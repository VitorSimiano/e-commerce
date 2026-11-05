
const els = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  success: document.getElementById('success'),
  empty: document.getElementById('empty'),
  table: document.getElementById('product-table'),
  list: document.getElementById('products-list'),
  pagination: document.getElementById('pagination'),
  paginationInfo: document.getElementById('pagination-info'),
  previous: document.getElementById('previous'),
  next: document.getElementById('next'),
  searchForm: document.getElementById('search-form'),
  search: document.getElementById('search'),
  clearSearch: document.getElementById('clear-search'),
  newProduct: document.getElementById('new-product'),
  form: document.getElementById('product-form'),
  formError: document.getElementById('form-error'),
  modalTitle: document.getElementById('modal-title'),
  saveButton: document.getElementById('save-product'),
  category: document.getElementById('category_id'),
  image: document.getElementById('image'),
  currentImage: document.getElementById('current-image'),
};

const modal = new bootstrap.Modal(document.getElementById('product-modal'));

let adminProductsPage = 1;
let lastPage = 1;
let search = '';
let editingProductId = null;

function showView(view) {
  els.loading.classList.toggle('d-none', view !== 'loading');
  els.empty.classList.toggle('d-none', view !== 'empty');
  els.table.classList.toggle('d-none', view !== 'table');
  els.pagination.classList.toggle('d-none', view !== 'table');
}

function showError(message) {
  els.error.textContent = message;
  els.error.classList.remove('d-none');
  els.success.classList.add('d-none');
}

function showSuccess(message) {
  els.success.textContent = message;
  els.success.classList.remove('d-none');
  els.error.classList.add('d-none');
}

function getValidationMessage(error) {
  const errors = error.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat().join(' ');
  }

  if (error.response?.status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  return error.response?.data?.message || errorMessage(error);
}

function imageUrl(path) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '');
  return `${API_ORIGIN}/storage/${cleanPath}`;
}

async function loadCategories() {
  const categories = await CatalogApi.categories();

  els.category.replaceChildren(
    el('option', '', 'Selecione')
  );

  categories.forEach((category) => {
    const option = el('option', '', category.name);
    option.value = category.id;
    els.category.appendChild(option);
  });
}

function renderProduct(product) {
  const row = el('tr');

  
  const productCell = el('td');
  const productInfo = el('div', 'd-flex align-items-center gap-2');

  if (product.image) {
    const image = el('img', 'admin-product-thumb');
    image.src = imageUrl(product.image);
    image.alt = product.name;
    productInfo.appendChild(image);
  } else {
    productInfo.appendChild(el('div', 'admin-product-thumb admin-product-placeholder', '👕'));
  }

  const name = el('div');
  name.append(
    el('strong', 'd-block', product.name),
    el('small', 'text-muted', product.team)
  );

  productInfo.appendChild(name);
  productCell.appendChild(productInfo);

  
  const categoryCell = el('td', '', product.category?.name || '—');

 
  const priceCell = el('td', '', formatPrice(product.price));

  
  const stockCell = el('td');
  const stockText = (product.variants || [])
    .map((variant) => `${variant.size}: ${variant.stock}`)
    .join(' | ');

  stockCell.textContent = stockText || 'Sem variantes';

  
  const statusCell = el('td');
  const active = Boolean(product.is_active);

  statusCell.appendChild(
    el(
      'span',
      `badge ${active ? 'text-bg-success' : 'text-bg-secondary'}`,
      active ? 'Ativo' : 'Inativo'
    )
  );

  
  const actionsCell = el('td', 'text-end text-nowrap');

  const editButton = el('button', 'btn btn-sm btn-outline-primary me-1', 'Editar');
  editButton.type = 'button';
  editButton.addEventListener('click', () => openEditModal(product));

  const toggleButton = el(
    'button',
    `btn btn-sm ${active ? 'btn-outline-warning' : 'btn-outline-success'} me-1`,
    active ? 'Desativar' : 'Ativar'
  );
  toggleButton.type = 'button';
  toggleButton.addEventListener('click', () => toggleProduct(product));

  const deleteButton = el('button', 'btn btn-sm btn-outline-danger', 'Excluir');
  deleteButton.type = 'button';
  deleteButton.addEventListener('click', () => deleteProduct(product));

  actionsCell.append(editButton, toggleButton, deleteButton);

  row.append(
    productCell,
    categoryCell,
    priceCell,
    stockCell,
    statusCell,
    actionsCell
  );

  return row;
}

async function loadProducts() {
  showView('loading');
  els.error.classList.add('d-none');

  try {
    const result = await AdminProductApi.list({
      page: adminProductsPage ,
      search,
    });

    const products = result.data || [];

    if (products.length === 0) {
      showView('empty');
      return;
    }

    lastPage = result.meta?.last_page || 1;

    els.list.replaceChildren(...products.map(renderProduct));

    els.paginationInfo.textContent =
      `Página ${adminProductsPage } de ${lastPage}`;

    els.previous.disabled = adminProductsPage <= 1;
    els.next.disabled = adminProductsPage >= lastPage;

    showView('table');
  } catch (error) {
    console.error(error);
    showError(getValidationMessage(error));
    showView('none');
  }
}

function resetForm() {
  els.form.reset();

  els.form.elements.is_active.checked = true;

  ['P', 'M', 'G', 'GG'].forEach((size, index) => {
    els.form.elements[`variants[${index}][stock]`].value = 0;
  });

  els.currentImage.src = '';
  els.currentImage.classList.add('d-none');
  els.formError.classList.add('d-none');
}

function openCreateModal() {
  editingProductId = null;
  resetForm();

  els.modalTitle.textContent = 'Cadastrar produto';
  els.saveButton.textContent = 'Cadastrar produto';

  modal.show();
}

function openEditModal(product) {
  editingProductId = product.id;
  resetForm();

  els.modalTitle.textContent = `Editar produto #${product.id}`;
  els.saveButton.textContent = 'Salvar alterações';

  els.form.elements.name.value = product.name;
  els.form.elements.team.value = product.team;
  els.form.elements.season.value = product.season;
  els.form.elements.description.value = product.description;
  els.form.elements.price.value = product.price;
  els.form.elements.category_id.value = product.category_id;
  els.form.elements.is_active.checked = Boolean(product.is_active);

  ['P', 'M', 'G', 'GG'].forEach((size, index) => {
    const variant = product.variants?.find((item) => item.size === size);

    els.form.elements[`variants[${index}][stock]`].value =
      variant?.stock ?? 0;
  });

  if (product.image) {
    els.currentImage.src = imageUrl(product.image);
    els.currentImage.classList.remove('d-none');
  }

  modal.show();
}

function buildFormData() {
  const formData = new FormData(els.form);

  formData.set('is_active', els.form.elements.is_active.checked ? '1' : '0');

  if (!els.image.files.length) {
    formData.delete('image');
  }

  return formData;
}

function buildProductFormData(product, active) {
  const formData = new FormData();

  formData.append('category_id', product.category_id);
  formData.append('name', product.name);
  formData.append('team', product.team);
  formData.append('season', product.season);
  formData.append('description', product.description);
  formData.append('price', product.price);
  formData.append('is_active', active ? '1' : '0');
  formData.append('_method', 'PUT');

  ['P', 'M', 'G', 'GG'].forEach((size, index) => {
    const variant = product.variants?.find((item) => item.size === size);

    formData.append(`variants[${index}][size]`, size);
    formData.append(`variants[${index}][stock]`, variant?.stock ?? 0);
  });

  return formData;
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  els.saveButton.disabled = true;
  els.saveButton.textContent = 'Salvando...';
  els.formError.classList.add('d-none');

  try {
    const formData = buildFormData();

    if (editingProductId) {
      formData.append('_method', 'PUT');

      await AdminProductApi.update(editingProductId, formData);
      showSuccess('Produto atualizado com sucesso.');
    } else {
      await AdminProductApi.create(formData);
      showSuccess('Produto cadastrado com sucesso.');
    }

    modal.hide();
    adminProductsPage = 1;
    await loadProducts();
  } catch (error) {
    console.error(error);
    els.formError.textContent = getValidationMessage(error);
    els.formError.classList.remove('d-none');
  } finally {
    els.saveButton.disabled = false;
    els.saveButton.textContent = editingProductId
      ? 'Salvar alterações'
      : 'Cadastrar produto';
  }
});

async function toggleProduct(product) {
  const newStatus = !product.is_active;
  const action = newStatus ? 'ativar' : 'desativar';

  if (!window.confirm(`Deseja realmente ${action} "${product.name}"?`)) {
    return;
  }

  try {
    const formData = buildProductFormData(product, newStatus);

    await AdminProductApi.update(product.id, formData);

    showSuccess(`Produto ${newStatus ? 'ativado' : 'desativado'} com sucesso.`);
    await loadProducts();
  } catch (error) {
    console.error(error);
    showError(getValidationMessage(error));
  }
}

async function deleteProduct(product) {
  if (!window.confirm(`Deseja realmente excluir "${product.name}"?`)) {
    return;
  }

  try {
    await AdminProductApi.delete(product.id);

    showSuccess('Produto excluído com sucesso.');
    await loadProducts();
  } catch (error) {
    console.error(error);
    showError(getValidationMessage(error));
  }
}

els.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  search = els.search.value.trim();
  adminProductsPage = 1;

  loadProducts();
});

els.clearSearch.addEventListener('click', () => {
  els.search.value = '';
  search = '';
  adminProductsPage = 1;

  loadProducts();
});

els.newProduct.addEventListener('click', openCreateModal);

els.previous.addEventListener('click', () => {
  if (adminProductsPage > 1) {
    adminProductsPage--;
    loadProducts();
  }
});

els.next.addEventListener('click', () => {
  if (adminProductsPage < lastPage) {
    adminProductsPage++;
    loadProducts();
  }
});

async function init() {
  const user = await requireAdmin();
  if (!user) return;

  try {
    await loadCategories();
    await loadProducts();
  } catch (error) {
    console.error(error);
    showError(getValidationMessage(error));
    showView('none');
  }
}

init();
