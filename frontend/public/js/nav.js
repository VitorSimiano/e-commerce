const NAV_LINKS = [
  { page: 'catalog', label: 'Catálogo', href: '/index.html' },
  { page: 'admin-products', label: 'Administrar produtos', href: '/admin-products.html', admin: true },
];


function currentPage() {
  return document.getElementById('site-nav').dataset.page;
}

function setCartBadge(total) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  badge.textContent = total;
  badge.classList.toggle('d-none', total === 0);
}

function renderNav() {
 
  document.getElementById('site-nav').innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="/index.html">⚽ Loja de Camisas</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Abrir menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav me-auto" id="nav-links"></ul>
          <ul class="navbar-nav align-items-lg-center gap-lg-2" id="nav-right">
            <li class="nav-item">
              <a class="nav-link" id="nav-cart" href="/cart.html">
                🛒 Carrinho <span id="cart-badge" class="badge rounded-pill text-bg-danger d-none">0</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>`;

  if (currentPage() === 'cart') {
    const cartLink = document.getElementById('nav-cart');
    cartLink.classList.add('active');
    cartLink.setAttribute('aria-current', 'page');
  }
}

function buildLinks(user) {
  const isAdmin = Boolean(user) && user.role === 'admin';

  const visible = NAV_LINKS.filter((link) => (!link.auth || user) && (!link.admin || isAdmin));

  const items = visible.map((link) => {
    const active = link.page === currentPage();
    const anchor = el('a', `nav-link${active ? ' active' : ''}`, link.label);
    anchor.href = link.href;
    if (active) anchor.setAttribute('aria-current', 'page');

    const item = el('li', 'nav-item');
    item.appendChild(anchor);
    return item;
  });

  document.getElementById('nav-links').replaceChildren(...items);
}

function buildUserMenu(user) {
  const right = document.getElementById('nav-right');

  if (!user) {
    const login = el('a', 'btn btn-outline-light btn-sm', 'Entrar');
    login.href = '/login.html';
    const register = el('a', 'btn btn-primary btn-sm', 'Cadastrar');
    register.href = '/register.html';

    [login, register].forEach((button) => {
      const item = el('li', 'nav-item');
      item.appendChild(button);
      right.appendChild(item);
    });
    return;
  }

  const toggle = el('a', 'nav-link dropdown-toggle', user.name);  
  toggle.href = '#';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('data-bs-toggle', 'dropdown');
  toggle.setAttribute('aria-expanded', 'false');
  if (user.role === 'admin') {
    toggle.appendChild(el('span', 'badge text-bg-warning ms-2', 'admin'));
  }

  const signOut = el('button', 'dropdown-item', 'Sair');
  signOut.type = 'button';
  signOut.addEventListener('click', logout);
  const signOutItem = el('li');
  signOutItem.appendChild(signOut);

  const menu = el('ul', 'dropdown-menu dropdown-menu-end');
  menu.appendChild(signOutItem);

  const item = el('li', 'nav-item dropdown');
  item.append(toggle, menu);
  right.appendChild(item);
}

async function refreshCartBadge() {
  const user = await sessionReady;

 
  if (!user && !localStorage.getItem(CART_TOKEN_KEY)) {
    setCartBadge(0);
    return;
  }

  try {
    const cart = await CartApi.get();
    setCartBadge(cart.total_items);
  } catch (error) {
    console.error(error);
  }
}

renderNav();
showFlash();
buildLinks(null);
sessionReady.then((user) => {
  buildLinks(user);
  buildUserMenu(user);
});
refreshCartBadge();