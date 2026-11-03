
function setCartBadge(total) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  badge.textContent = total;
  badge.classList.toggle('d-none', total === 0);
}

async function refreshCartBadge() {

  if (!localStorage.getItem(CART_TOKEN_KEY)) {
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

refreshCartBadge();