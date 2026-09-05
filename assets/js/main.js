/* =========================================================
   ICFCIT 2027 — interaction layer
   Nav drawer · scroll progress · reveal · countdown ·
   accordion · counters · back-to-top
   ========================================================= */
(function () {
  'use strict';

  var d = document;
  var body = d.body;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Mobile navigation ---------- */
  var toggle = $('.nav__toggle');
  var scrim = $('.nav-scrim');

  function closeNav() {
    body.classList.remove('nav-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (scrim) { scrim.addEventListener('click', closeNav); }
  $$('.nav__menu a').forEach(function (a) { a.addEventListener('click', closeNav); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeNav(); }
  });

  /* ---------- Sticky header shadow + scroll progress ---------- */
  var header = $('.site-header');
  var bar = $('.progress');
  var toTop = $('.to-top');

  function onScroll() {
    var y = window.pageYOffset || d.documentElement.scrollTop;

    if (header) { header.classList.toggle('is-stuck', y > 8); }
    if (toTop) { toTop.classList.toggle('show', y > 520); }

    if (bar) {
      var h = d.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Accordion ---------- */
  $$('.acc').forEach(function (acc) {
    var items = $$('.acc__item', acc);
    items.forEach(function (item) {
      var btn = $('.acc__btn', item);
      var panel = $('.acc__panel', item);
      if (!btn || !panel) { return; }

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        items.forEach(function (other) {
          other.classList.remove('open');
          var p = $('.acc__panel', other);
          var b = $('.acc__btn', other);
          if (p) { p.style.maxHeight = null; }
          if (b) { b.setAttribute('aria-expanded', 'false'); }
        });

        if (!isOpen) {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  window.addEventListener('resize', function () {
    $$('.acc__item.open .acc__panel').forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* ---------- Countdown to the conference ---------- */
  var cd = $('[data-countdown]');
  if (cd) {
    var target = new Date(cd.getAttribute('data-countdown')).getTime();
    var fields = {
      days: $('[data-cd="days"]', cd),
      hours: $('[data-cd="hours"]', cd),
      minutes: $('[data-cd="minutes"]', cd),
      seconds: $('[data-cd="seconds"]', cd)
    };

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    var tick = function () {
      var diff = target - Date.now();
      if (diff < 0) { diff = 0; }

      var s = Math.floor(diff / 1000);
      var days = Math.floor(s / 86400);
      var hours = Math.floor((s % 86400) / 3600);
      var minutes = Math.floor((s % 3600) / 60);
      var seconds = s % 60;

      if (fields.days) { fields.days.textContent = days; }
      if (fields.hours) { fields.hours.textContent = pad(hours); }
      if (fields.minutes) { fields.minutes.textContent = pad(minutes); }
      if (fields.seconds) { fields.seconds.textContent = pad(seconds); }
    };

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Animated counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        cio.unobserve(el);

        var end = parseFloat(el.getAttribute('data-count'));
        var dur = 1500;
        var start = performance.now();

        var step = function (now) {
          var t = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(end * eased).toLocaleString('en-IN');
          if (t < 1) { requestAnimationFrame(step); }
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Duplicate ticker content for a seamless loop ---------- */
  var track = $('.ticker__track');
  if (track && !track.dataset.cloned) {
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = '1';
  }

  /* ---------- Current year ---------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
