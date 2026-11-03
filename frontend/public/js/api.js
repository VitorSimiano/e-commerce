const CART_TOKEN_KEY = 'cart_token';

const api = axios.create({
  baseURL: window.APP_CONFIG.API_URL,
  headers: { Accept: 'application/json' },
});

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