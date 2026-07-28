const subscribeForm = document.querySelector('[data-subscribe-form]');
const subscribeMessage = document.querySelector('[data-subscribe-message]');

subscribeForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(subscribeForm).entries());
  const subscribers = JSON.parse(localStorage.getItem('flora-subscribers') || '[]');
  subscribers.push({ email: data.email, createdAt: new Date().toISOString() });
  localStorage.setItem('flora-subscribers', JSON.stringify(subscribers));

  subscribeMessage.textContent = 'Subscription saved locally.';
  subscribeForm.reset();

  setTimeout(() => {
    subscribeMessage.textContent = '';
  }, 1800);
});
