const menu = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menu?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => navLinks?.classList.remove('is-open'));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.process-card, .audience-card, .receipt-card, .trust-flow').forEach((element) => {
  element.classList.add('reveal');
  observer.observe(element);
});
