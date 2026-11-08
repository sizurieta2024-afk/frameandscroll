/* Progressive polish: Lenis smooth scroll + Motion springs. Page works without it. */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 1. Lenis: inertial smooth scrolling (makes the frame scrub feel like video)
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var el = document.querySelector(a.getAttribute('href'));
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70, duration: 1.4 }); }
      });
    });
  }
  if (!window.Motion) return;
  var M = window.Motion;
  // 2. Hero headline: words rise in with a spring stagger
  document.querySelectorAll('.beat.b1 h1').forEach(function(h){
    var html = h.innerHTML.split(/(<br\s*\/?>)/i).map(function(part){
      return /^<br/i.test(part) ? part : part.split(' ').filter(Boolean).map(function(w){
        return '<span class="w" style="display:inline-block;opacity:0;transform:translateY(40px)">' + w + '</span>';
      }).join(' ');
    }).join('');
    h.innerHTML = html;
    M.animate(h.querySelectorAll('.w'), { opacity: [0, 1], y: [40, 0] },
      { type: 'spring', stiffness: 120, damping: 18, delay: M.stagger(0.08, { startDelay: 0.2 }) });
  });
  // 3. Section reveals: grouped spring stagger instead of a flat fade
  var groups = new Set();
  document.querySelectorAll('.reveal').forEach(function(el){ groups.add(el.parentElement); el.classList.add('in'); el.style.opacity = 0; el.style.transform = 'translateY(30px)'; el.style.transition = 'none'; });
  var pending = Array.from(groups);
  function play(g){
    pending.splice(pending.indexOf(g), 1);
    M.animate(g.querySelectorAll(':scope > .reveal'), { opacity: [0, 1], y: [30, 0] },
      { type: 'spring', stiffness: 90, damping: 16, delay: M.stagger(0.09) });
  }
  pending.slice().forEach(function(g){
    M.inView(g, function(){ if (pending.indexOf(g) > -1) play(g); }, { amount: 0.15 });
  });
  // anything jumped past (anchor links, fast flicks) appears instantly
  addEventListener('scroll', function(){
    pending.slice().forEach(function(g){
      if (g.getBoundingClientRect().bottom < 0) {
        pending.splice(pending.indexOf(g), 1);
        g.querySelectorAll(':scope > .reveal').forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
      }
    });
  }, { passive: true });
  // 4. Cards: subtle magnetic tilt on hover (desktop only)
  if (matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.step, .gallery figure').forEach(function(c){
      c.addEventListener('pointermove', function(e){
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        M.animate(c, { rotateX: -y * 5, rotateY: x * 5, scale: 1.015 }, { duration: 0.3 });
      });
      c.addEventListener('pointerleave', function(){ M.animate(c, { rotateX: 0, rotateY: 0, scale: 1 }, { type: 'spring', stiffness: 200, damping: 15 }); });
      c.style.transformPerspective = '900px';
    });
  }
})();
