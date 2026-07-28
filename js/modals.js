const productBackdrop = document.querySelector('[data-product-backdrop]');
const orderBackdrop = document.querySelector('[data-order-backdrop]');
const productContent = document.querySelector('[data-product-content]');
const productClose = document.querySelector('[data-product-close]');
const orderClose = document.querySelector('[data-order-close]');
const orderProductId = document.querySelector('[data-order-product-id]');
const orderQuantity = document.querySelector('[data-order-quantity]');
const orderForm = document.querySelector('[data-order-form]');
const orderMessage = document.querySelector('[data-order-message]');

let activeProduct = null;

const toggleModalLock = () => {
  const anyModalOpen = document.querySelector('.modal-backdrop.is-open');
  document.body.classList.toggle('modal-lock', Boolean(anyModalOpen));
};

const openBackdrop = backdrop => {
  backdrop?.classList.add('is-open');
  backdrop?.setAttribute('aria-hidden', 'false');
  toggleModalLock();
};

const closeBackdrop = backdrop => {
  backdrop?.classList.remove('is-open');
  backdrop?.setAttribute('aria-hidden', 'true');
  toggleModalLock();
};

const closeAllModals = () => {
  closeBackdrop(productBackdrop);
  closeBackdrop(orderBackdrop);
};

const getQuantityValue = () => {
  const quantityInput = productContent?.querySelector('[data-product-quantity]');
  const value = Number(quantityInput?.value || 1);

  if (!Number.isFinite(value) || value < 1) return 1;
  if (value > 99) return 99;

  return Math.round(value);
};

const renderProductModal = item => {
  if (!productContent) return;

  activeProduct = item;
  productContent.replaceChildren();
  productContent.insertAdjacentHTML('beforeend', `
    <picture>
      <source type="image/webp" srcset="./images/${item.image}@X1.webp 1x, ./images/${item.image}@X2.webp 2x">
      <img class="product-modal__image" src="./images/${item.image}@X1.jpg" srcset="./images/${item.image}@X2.jpg 2x" alt="${item.alt}">
    </picture>
    <div class="product-modal__info">
      <h2 class="product-modal__title" id="product-modal-title">${item.name}</h2>
      <p class="product-modal__price">$${item.price}</p>
      <p class="product-modal__text body-text">${item.description} Whether you’re celebrating a birthday, sending love, or simply brightening someone’s day, this arrangement is sure to bring warm smiles and lasting impressions.</p>
      <div class="product-modal__actions">
        <button class="lime-button" type="button" data-buy-product="${item.id}">Buy now</button>
        <label class="product-modal__quantity-label">
          <span class="visually-hidden">Quantity</span>
          <input class="product-modal__quantity" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" data-product-quantity aria-label="Quantity">
        </label>
      </div>
    </div>`);
};

document.addEventListener('click', event => {
  const productButton = event.target.closest('[data-product-open]');
  if (productButton) {
    const product = window.floraCatalog?.findProduct(productButton.dataset.productOpen);
    if (!product) return;
    renderProductModal(product);
    openBackdrop(productBackdrop);
    return;
  }

  const buyButton = event.target.closest('[data-buy-product]');
  if (buyButton) {
    const quantity = getQuantityValue();

    if (orderProductId) orderProductId.value = buyButton.dataset.buyProduct;
    if (orderQuantity) orderQuantity.value = String(quantity);

    closeBackdrop(productBackdrop);
    openBackdrop(orderBackdrop);
  }
});

productContent?.addEventListener('input', event => {
  const quantityInput = event.target.closest('[data-product-quantity]');
  if (!quantityInput) return;

  const fixedValue = getQuantityValue();
  quantityInput.value = String(fixedValue);
});

productClose?.addEventListener('click', () => closeBackdrop(productBackdrop));
orderClose?.addEventListener('click', () => closeBackdrop(orderBackdrop));

productBackdrop?.addEventListener('click', event => {
  if (event.target === productBackdrop) closeBackdrop(productBackdrop);
});

orderBackdrop?.addEventListener('click', event => {
  if (event.target === orderBackdrop) closeBackdrop(orderBackdrop);
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAllModals();
});

orderForm?.addEventListener('submit', event => {
  event.preventDefault();

  const formValues = Object.fromEntries(new FormData(orderForm).entries());
  const selectedProduct = window.floraCatalog?.findProduct(formValues.productId) || activeProduct;
  const quantity = Number(formValues.quantity || 1);
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.round(quantity) : 1;

  const order = {
    ...formValues,
    quantity: safeQuantity,
    productName: selectedProduct?.name || '',
    productPrice: selectedProduct?.price || 0,
    total: selectedProduct?.price ? selectedProduct.price * safeQuantity : 0,
    createdAt: new Date().toISOString()
  };

  const orders = JSON.parse(localStorage.getItem('flora-orders') || '[]');
  orders.push(order);
  localStorage.setItem('flora-orders', JSON.stringify(orders));

  orderMessage.textContent = 'Order saved locally.';
  orderForm.reset();
  if (orderQuantity) orderQuantity.value = '1';

  setTimeout(() => {
    orderMessage.textContent = '';
    closeBackdrop(orderBackdrop);
  }, 1800);
});
