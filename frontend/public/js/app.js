const statusEl = document.getElementById('api-status');
const listEl = document.getElementById('categories');

async function loadCategories() {
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/categories`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { data } = await response.json();

    statusEl.textContent = `API conectada: ${data.length} categorias.`;

    data.forEach((category) => {
      const item = document.createElement('li');
      // textContent treats the API text as plain text (never as HTML)
      item.textContent = `${category.flag} ${category.name} (${category.league})`;
      listEl.appendChild(item);
    });
  } catch (error) {
    statusEl.textContent = `Falha ao falar com a API: ${error.message}`;
  }
}

loadCategories();