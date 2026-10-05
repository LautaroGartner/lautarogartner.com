// The portrait remains visible and readable without JavaScript.
(() => {
 const portrait = document.querySelector('[data-about-portrait]');
 if (!portrait) return;
 const windowElement = portrait.querySelector('.portrait-window');
 const image = portrait.querySelector('img');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let frame = 0, reveal;
 const paint = () => {
  frame = 0;
  if (reduced.matches) { image.style.removeProperty('transform'); return; }
  const rect = windowElement.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return;
  const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight));
  image.style.transform = `translate3d(0,${(progress * 18).toFixed(2)}px,0) scale(1.045)`;
 };
 const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
 addEventListener('scroll', schedule, { passive: true });
 addEventListener('resize', schedule);
 reduced.addEventListener('change', () => { reveal?.cancel(); paint(); });
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   if (!entries.some(entry => entry.isIntersecting)) return;
   observer.disconnect();
   if (!reduced.matches) reveal = windowElement.animate(
    [{ clipPath: 'inset(10% 0 0 0)', transform: 'translateY(18px)' }, { clipPath: 'inset(0)', transform: 'none' }],
    { duration: 900, easing: 'cubic-bezier(.22,.61,.36,1)' }
   );
  }, { threshold: .12 });
  observer.observe(portrait);
 }
 paint();
})();
