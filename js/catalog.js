const catalogList = document.querySelector('[data-catalog-list]');
const catalogForm = document.querySelector('[data-catalog-filters]');
const loadMoreBtn = document.querySelector('[data-load-more]');
const catalogStatus = document.querySelector('[data-catalog-status]');

const catalogState = {
  products: [],
  visibleItems: [],
  page: 1,
  limit: 4,
  search: '',
  category: 'all',
  priceMax: 'all',
  loading: false
};

const buildImage = item => `
  <picture>
    <source type="image/webp" srcset="./images/${item.image}@X1.webp 1x, ./images/${item.image}@X2.webp 2x">
    <img loading="lazy" src="./images/${item.image}@X1.jpg" srcset="./images/${item.image}@X2.jpg 2x" alt="${item.alt}" width="250" class="catalog-card__image">
  </picture>`;

const buildCard = item => `
  <li class="catalog-card" data-product-id="${item.id}">
    <button class="catalog-card__button" type="button" data-product-open="${item.id}" aria-label="Open ${item.name} details">
      ${buildImage(item)}
      <h3 class="catalog-card__title">${item.name}</h3>
      <p class="body-text card-note">${item.description}</p>
      <p class="catalog-card__price">$${item.price}</p>
    </button>
  </li>`;

const applyCatalogFilters = () => {
  const normalizedSearch = catalogState.search.trim().toLowerCase();

  return catalogState.products.filter(item => {
    const hasSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);
    const hasCategory = catalogState.category === 'all' || item.category === catalogState.category;
    const hasPrice = catalogState.priceMax === 'all' || item.price <= Number(catalogState.priceMax);

    return hasSearch && hasCategory && hasPrice;
  });
};

const renderCatalog = ({ reset = false } = {}) => {
  if (!catalogList || !loadMoreBtn || !catalogStatus) return;

  const filteredItems = applyCatalogFilters();
  const itemsToRender = filteredItems.slice(0, catalogState.page * catalogState.limit);
  catalogState.visibleItems = itemsToRender;

  if (reset) catalogList.replaceChildren();

  catalogList.replaceChildren();
  catalogList.insertAdjacentHTML('beforeend', itemsToRender.map(buildCard).join(''));

  const hiddenCount = filteredItems.length - itemsToRender.length;
  loadMoreBtn.hidden = hiddenCount <= 0;
  catalogStatus.textContent = filteredItems.length
    ? `Shown ${itemsToRender.length} of ${filteredItems.length} bouquets.`
    : 'No bouquets match selected filters.';
};

const requestBouquets = async () => {
  if (!catalogList || !loadMoreBtn || !catalogStatus) return;

  try {
    catalogState.loading = true;
    catalogStatus.textContent = 'Loading bouquets...';

    const requestParams = {
      page: catalogState.page,
      limit: catalogState.limit,
      category: catalogState.category,
      priceMax: catalogState.priceMax,
      search: catalogState.search
    };

    let response;
    try {
      response = await axios.get('./db.json', { params: requestParams });
    } catch (paramError) {
      response = await axios.get('./db.json');
    }

    catalogState.products = Array.isArray(response.data.bouquets) ? response.data.bouquets : [];
    renderCatalog({ reset: true });
  } catch (error) {
    catalogStatus.textContent = 'Unable to load bouquets. Please try again later.';
    catalogList.replaceChildren();
    loadMoreBtn.hidden = true;
    console.error('Catalog loading failed:', error);
  } finally {
    catalogState.loading = false;
  }
};

catalogForm?.addEventListener('input', event => {
  const formData = new FormData(catalogForm);
  catalogState.search = String(formData.get('search') || '');
  catalogState.category = String(formData.get('category') || 'all');
  catalogState.priceMax = String(formData.get('priceMax') || 'all');
  catalogState.page = 1;
  requestBouquets();
});

catalogForm?.addEventListener('change', () => {
  const formData = new FormData(catalogForm);
  catalogState.search = String(formData.get('search') || '');
  catalogState.category = String(formData.get('category') || 'all');
  catalogState.priceMax = String(formData.get('priceMax') || 'all');
  catalogState.page = 1;
  requestBouquets();
});

loadMoreBtn?.addEventListener('click', () => {
  catalogState.page += 1;
  renderCatalog();
});

window.floraCatalog = {
  getItems: () => [...catalogState.products],
  findProduct: id => catalogState.products.find(item => String(item.id) === String(id)),
  renderImage: buildImage
};

requestBouquets();
