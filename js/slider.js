const mountHorizontalScroller = ({ root, track, previous, next, dots }) => {
  const scope = document.querySelector(root);
  if (!scope) return;

  const rail = scope.querySelector(track);
  const prevButton = scope.querySelector(previous);
  const nextButton = scope.querySelector(next);
  const dotsRoot = scope.querySelector(dots);
  if (!rail) return;

  let renderedDotsCount = 0;

  const getGap = () => {
    const styles = window.getComputedStyle(rail);
    return Number.parseFloat(styles.columnGap || styles.gap) || 0;
  };

  const getStep = () => {
    const firstCard = rail.firstElementChild;
    if (!firstCard) return 0;
    return firstCard.getBoundingClientRect().width + getGap();
  };

  const getMaxLeft = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

  const getPageCount = () => {
    const step = getStep();
    const maxLeft = getMaxLeft();

    if (!step || maxLeft <= 2) return 1;

    return Math.min(rail.children.length, Math.ceil(maxLeft / step) + 1);
  };

  const getCurrentPage = () => {
    const step = getStep();
    const pageCount = getPageCount();

    if (!step || pageCount === 1) return 0;

    return Math.min(pageCount - 1, Math.round(rail.scrollLeft / step));
  };

  const renderDots = () => {
    if (!dotsRoot) return;

    const pageCount = getPageCount();
    if (renderedDotsCount === pageCount && dotsRoot.children.length === pageCount) return;

    renderedDotsCount = pageCount;
    dotsRoot.replaceChildren();

    for (let index = 0; index < pageCount; index += 1) {
      const dot = document.createElement('li');
      dot.className = index === 0 ? 'slider-dot is-current' : 'slider-dot';

      const button = document.createElement('button');
      button.className = 'slider-dot__button';
      button.type = 'button';
      button.setAttribute('aria-label', `Go to slide ${index + 1}`);

      button.addEventListener('click', () => {
        const targetLeft = Math.min(getStep() * index, getMaxLeft());
        rail.scrollTo({ left: targetLeft, behavior: 'smooth' });
      });

      dot.append(button);
      dotsRoot.append(dot);
    }
  };

  const setArrowState = () => {
    const maxLeft = getMaxLeft();
    if (prevButton) prevButton.disabled = maxLeft <= 2 || rail.scrollLeft <= 1;
    if (nextButton) nextButton.disabled = maxLeft <= 2 || rail.scrollLeft >= maxLeft - 4;
  };

  const setActiveDot = () => {
    if (!dotsRoot) return;

    const currentPage = getCurrentPage();
    [...dotsRoot.children].forEach((dot, index) => {
      dot.classList.toggle('is-current', index === currentPage);
    });
  };

  const refreshScroller = () => requestAnimationFrame(() => {
    renderDots();
    setArrowState();
    setActiveDot();
  });

  prevButton?.addEventListener('click', () => {
    rail.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  nextButton?.addEventListener('click', () => {
    rail.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  rail.addEventListener('scroll', refreshScroller, { passive: true });
  window.addEventListener('resize', refreshScroller);
  window.addEventListener('load', refreshScroller);
  refreshScroller();
};

mountHorizontalScroller({
  root: '.top-slider',
  track: '.top-list',
  previous: '.arrow-button--prev',
  next: '.arrow-button--next',
  dots: '.slider-dots'
});

mountHorizontalScroller({
  root: '.reviews-slider',
  track: '.reviews-list',
  previous: '.arrow-button--prev',
  next: '.arrow-button--next',
  dots: '.slider-dots'
});
