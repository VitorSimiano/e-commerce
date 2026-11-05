const CART_TOKEN_KEY = 'cart_token';

const API_ORIGIN = new URL(window.APP_CONFIG.API_URL).origin;

const api = axios.create({
  baseURL: window.APP_CONFIG.API_URL,
  withCredentials: true,  
  withXSRFToken: true,     
  headers: { Accept: 'application/json' },
});

function hasCsrfCookie() {
  return document.cookie.split('; ').some((cookie) => cookie.startsWith('XSRF-TOKEN='));
}

function fetchCsrfCookie() {
  return axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, { withCredentials: true });
}


api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (method !== 'get' && !hasCsrfCookie()) {
    await fetchCsrfCookie();
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 419 && config && !config._retried) {
      config._retried = true;
      await fetchCsrfCookie();
      return api(config);
    }

    return Promise.reject(error);
  },
);


const CatalogApi = {
  categories: () => api.get('/categories').then((response) => response.data.data),
  products: (params) => api.get('/products', { params }).then((response) => response.data),
  product: (id) => api.get(`/products/${id}`).then((response) => response.data.data),
};


function cartHeaders() {
  const token = localStorage.getItem(CART_TOKEN_KEY);
  return token ? { 'X-Cart-Token': token } : {};
}


function rememberCartToken(cart) {
  if (cart.token) {
    localStorage.setItem(CART_TOKEN_KEY, cart.token);
  } else {
    localStorage.removeItem(CART_TOKEN_KEY);
  }
  return cart;
}

const CartApi = {
  get: () =>
    api.get('/cart', { headers: cartHeaders() })
      .then((response) => rememberCartToken(response.data.data)),

  addItem: (variantId, quantity) =>
    api.post('/cart/items', { product_variant_id: variantId, quantity }, { headers: cartHeaders() })
      .then((response) => rememberCartToken(response.data.data)),

  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }, { headers: cartHeaders() })
      .then((response) => rememberCartToken(response.data.data)),

  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`, { headers: cartHeaders() })
      .then((response) => rememberCartToken(response.data.data)),
};


function withGuestCart(payload) {
  const token = localStorage.getItem(CART_TOKEN_KEY);
  return token ? { ...payload, cart_token: token } : payload;
}


function finishAuth(response) {
  localStorage.removeItem(CART_TOKEN_KEY);

  const merge = response.data.cart_merge || { merged: false, adjustments: [] };

  if (merge.adjustments.length > 0) {
    setFlash('warning', [
      'Seu carrinho de visitante foi unido ao da sua conta, com ajustes:',
      ...merge.adjustments.map(describeAdjustment),
    ]);
  } else if (merge.merged) {
    setFlash('success', ['Os itens do seu carrinho foram unidos ao carrinho da sua conta.']);
  }

  return response.data.data;
}


const AuthApi = {
  
  me: () => api.get('/auth/me').then((response) => response.data.data),

  register: async (payload) => {
    await fetchCsrfCookie();
    return api.post('/auth/register', withGuestCart(payload)).then(finishAuth);
  },

  login: async (payload) => {
    await fetchCsrfCookie();
    return api.post('/auth/login', withGuestCart(payload)).then(finishAuth);
  },

  logout: () => api.post('/auth/logout'),
};


const OrderApi = {
  list: (page = 1) =>
    api.get('/orders', { params: { page } })
      .then((response) => response.data),

  show: (id) =>
    api.get(`/orders/${id}`)
      .then((response) => response.data.data),

  create: (shippingData) =>
    api.post('/orders', shippingData)
      .then((response) => response.data.data),

  pay: (id) =>
    api.post(`/orders/${id}/pay`)
      .then((response) => response.data.data),

  cancel: (id) =>
    api.post(`/orders/${id}/cancel`)
      .then((response) => response.data.data),
};


const AdminProductApi = {
  list: (params = {}) =>
    api.get('/admin/products', { params })
      .then((response) => response.data),

  create: (formData) =>
    api.post('/admin/products', formData)
      .then((response) => response.data.data),

  update: (id, formData) =>
    api.post(`/admin/products/${id}`, formData)
      .then((response) => response.data.data),

  delete: (id) =>
    api.delete(`/admin/products/${id}`),
};

