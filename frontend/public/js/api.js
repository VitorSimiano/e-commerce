const CART_TOKEN_KEY = 'cart_token';

// The CSRF cookie route lives OUTSIDE /api, so the API origin is derived from the base URL
const API_ORIGIN = new URL(window.APP_CONFIG.API_URL).origin;

const api = axios.create({
  baseURL: window.APP_CONFIG.API_URL,
  withCredentials: true,   // the browser sends the session cookie
  withXSRFToken: true,     // axios copies the XSRF-TOKEN cookie into the X-XSRF-TOKEN header
  headers: { Accept: 'application/json' },
});

function hasCsrfCookie() {
  return document.cookie.split('; ').some((cookie) => cookie.startsWith('XSRF-TOKEN='));
}

function fetchCsrfCookie() {
  return axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, { withCredentials: true });
}

// Before any call that changes data, make sure the CSRF cookie exists
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (method !== 'get' && !hasCsrfCookie()) {
    await fetchCsrfCookie();
  }

  return config;
});

// 419 = stale CSRF token: refresh it once and repeat the same request
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

// All catalog calls live here, so no other file knows URLs
const CatalogApi = {
  categories: () => api.get('/categories').then((response) => response.data.data),
  products: (params) => api.get('/products', { params }).then((response) => response.data),
  product: (id) => api.get(`/products/${id}`).then((response) => response.data.data),
};

// The guest cart token travels in a header ONLY on cart calls
function cartHeaders() {
  const token = localStorage.getItem(CART_TOKEN_KEY);
  return token ? { 'X-Cart-Token': token } : {};
}

// The server puts the token inside the cart it returns. This keeps the browser copy in sync
function rememberCartToken(cart) {
  if (cart.token) {
    localStorage.setItem(CART_TOKEN_KEY, cart.token);
  } else {
    localStorage.removeItem(CART_TOKEN_KEY);
  }
  return cart;
}

// Every call answers with the WHOLE updated cart: { token, items, total_items, total }
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

// Session authentication: the identity is the session cookie, never something stored by JS
// The guest cart travels with the login/register request so the server can merge it
function withGuestCart(payload) {
  const token = localStorage.getItem(CART_TOKEN_KEY);
  return token ? { ...payload, cart_token: token } : payload;
}

// After a successful login/register the guest cart no longer exists on the server:
// forget its token and keep the merge notices for the next page
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

// Session authentication: the identity is the session cookie, never something stored by JS
const AuthApi = {
  // 401 when nobody is logged in
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