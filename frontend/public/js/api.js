
const api = axios.create({
  baseURL: window.APP_CONFIG.API_URL,
  headers: { Accept: 'application/json' },
});


const CatalogApi = {
  
  categories: () => api.get('/categories').then((response) => response.data.data),

  products: (params) => api.get('/products', { params }).then((response) => response.data),

  product: (id) => api.get(`/products/${id}`).then((response) => response.data.data),
};