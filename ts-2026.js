// ── Countdown Timer ──

function timer() {
  return {
    days: ['0','0'],
    hours: ['0','0'],
    minutes: ['0','0'],
    seconds: ['0','0'],
    targetDate: new Date('2026-09-08T07:30:00').getTime(),
    start() {
      this.updateTimer();
      setInterval(() => this.updateTimer(), 1000);
    },
    updateTimer() {
      const distance = this.targetDate - Date.now();

      if (distance > 0) {
        this.days    = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2,'0').split('');
        this.hours   = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2,'0').split('');
        this.minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2,'0').split('');
        this.seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2,'0').split('');
      } else {
        this.days = this.hours = this.minutes = this.seconds = ['0','0'];
      }
    }
  };
}


document.addEventListener("DOMContentLoaded", () => {

  let paused = false;

  if ('IntersectionObserver' in window) {
    const headerVideos = Array.from(document.querySelectorAll('.trade-show-video-layer video'));
    if (headerVideos.length) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const v = entry.target;
          if (entry.intersectionRatio > 0.50) {
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else {
            v.pause();
          }
        });
      }, { threshold: [0, 0.50] });
      headerVideos.forEach(v => videoObserver.observe(v));
    }
  }

// ── Fade From Top ──

  const fadeTopItems = document.querySelectorAll(".fade-from-top");
  if (fadeTopItems.length) {
    const fadeTopObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    fadeTopItems.forEach(el => fadeTopObserver.observe(el));
  }

// ── Fade From Left ──

  const fadeLeftItems = document.querySelectorAll(".fade-from-left");
  if (fadeLeftItems.length) {
    const fadeLeftObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const grid = entry.target.closest(".exp-grid");
          if (grid) {
            const gridItems = grid.querySelectorAll(".fade-from-left");
            const index = Array.from(gridItems).indexOf(entry.target);
            entry.target.style.animationDelay = `${index * 0.15}s`;
          } else {
            entry.target.style.animationDelay = `0.3s`;
          }
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeLeftItems.forEach(el => fadeLeftObserver.observe(el));
  }

  // ── Read More / Read Less Toggle ──

  const container = document.querySelector(".trade-show-2026-intro-container");
  const btn = document.getElementById("readMoreBtn");
  if (container && btn) {
    btn.addEventListener("click", () => {
      container.classList.toggle("expanded");
      btn.textContent = container.classList.contains("expanded") ? "Read Less" : "Read More";
    });
  }

  // ── Infinite Scroll Track ──

  const track = document.querySelector('.trade-show-img-track');
  if (track) {
    let speed = 1.15;
    let pos = 0;
    let isVisible = false;
    let rafId = null;
    const outer = document.getElementById('TradeShowContainerOuter');
    if (outer) outer.style.visibility = 'hidden';

    function fillTrack() {
      const items = Array.from(track.children);
      if (!items.length) return;

      const trackWidth = track.parentElement.offsetWidth;
      let totalWidth = items.reduce((sum, el) => sum + el.offsetWidth, 0);

      if (totalWidth <= 0 || trackWidth <= 0) return;

      let guard = 0;
      while (totalWidth < trackWidth * 3 && guard < 50) {
        items.forEach(item => {
          const clone = item.cloneNode(true);
          clone.querySelectorAll('img').forEach(img => img.loading = 'eager');
          track.appendChild(clone);
          totalWidth += item.offsetWidth;
        });
        guard++;
      }
    }

    function preloadSrc(src) {
      return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.decode().then(resolve).catch(resolve);
      });
    }

    function appendClone(item) {
      const clone = item.cloneNode(true);
      clone.querySelectorAll('img').forEach(img => img.loading = 'eager');
      track.appendChild(clone);
    }

    track.parentElement.addEventListener('mouseenter', () => paused = true);
    track.parentElement.addEventListener('mouseleave', () => paused = false);

    function animateTrack() {
      if (isVisible && !paused) {
        pos -= speed;
        const firstItem = track.firstElementChild;
        if (firstItem) {
          const gap = parseFloat(getComputedStyle(track).gap) || 0;
          if (firstItem.getBoundingClientRect().right < 0) {
            pos += firstItem.offsetWidth + gap;
            appendClone(firstItem);
            track.removeChild(firstItem);
          }
        }
        track.style.transform = `translateX(${pos}px)`;
      }
      rafId = requestAnimationFrame(animateTrack);
    }

    function startTrackObserver() {
      const trackObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
          if (isVisible && rafId === null) {
            rafId = requestAnimationFrame(animateTrack);
          }
        });
      }, { threshold: 0.1 });
      trackObserver.observe(track.parentElement);
    }

    const images = Array.from(track.querySelectorAll('img'));
    Promise.all(images.map(img => preloadSrc(img.src))).then(() => {
      fillTrack();
      if (outer) outer.style.visibility = '';
      track.classList.add('is-loaded');
      const fadeParent = track.closest('.fade-from-left');
      if (fadeParent) {
        fadeParent.addEventListener('animationend', startTrackObserver, { once: true });
      } else {
        startTrackObserver();
      }
    });
  }

  // ── Image Lightbox ──

  (function () {
    const lightbox = document.getElementById('TradeShowLightbox');
    const lightboxImg = document.getElementById('TradeShowLightboxImg');
    const btnClose = document.getElementById('TradeShowLightboxClose');
    const btnPrev = document.getElementById('TradeShowLightboxPrev');
    const btnNext = document.getElementById('TradeShowLightboxNext');
    if (!lightbox || !track) return;

    document.body.appendChild(lightbox);

    const seen = new Set();
    const gallery = [];
    Array.from(track.querySelectorAll('img')).forEach(img => {
      const key = img.dataset.full || img.src;
      if (!seen.has(key)) {
        seen.add(key);
        gallery.push({
          key,
          full: img.dataset.full || img.src,
          alt: img.alt
        });
      }
    });

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      showImage(currentIndex);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      paused = true;
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      paused = false;
    }

    function showImage(index) {
      const item = gallery[index];
      if (!item) return;
      lightboxImg.classList.remove('is-loaded');
      const preload = new Image();
      preload.onload = () => {
        lightboxImg.src = item.full;
        lightboxImg.alt = item.alt;
        lightboxImg.classList.add('is-loaded');
      };
      preload.src = item.full;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
      showImage(currentIndex);
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % gallery.length;
      showImage(currentIndex);
    }

    track.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const key = img.dataset.full || img.src;
      const index = gallery.findIndex(g => g.key === key);
      if (index > -1) openLightbox(index);
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', showPrev);
    btnNext.addEventListener('click', showNext);

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  })();

  // ── Video Player Init ──

  document.querySelectorAll('.video-wrapper').forEach(wrapper => {
    const src = wrapper.dataset.video;
    if (!src) return;

    const video = document.createElement('video');
    video.src = src;
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    video.muted = true;
    video.autoplay = false;
    wrapper.appendChild(video);

    const placeholder = document.createElement('div');
    placeholder.className = 'video-placeholder';
    if (wrapper.dataset.poster) {
      placeholder.style.backgroundImage = `url("${wrapper.dataset.poster}")`;
    }
    placeholder.innerHTML = '<button class="video-play-btn" aria-label="Play"></button>';
    wrapper.appendChild(placeholder);

    let built = false;

    function start() {
      video.style.opacity = '1';
      placeholder.style.opacity = '0';
      setTimeout(() => { placeholder.style.display = 'none'; }, 500);
      if (!built) { buildControls(wrapper, video); built = true; }

      video.muted = false;

      const muteBtn = wrapper.querySelector('.ctrl-mute');
      if (muteBtn) {
        muteBtn.querySelector('.icon-vol').style.display = '';
        muteBtn.querySelector('.icon-muted').style.display = 'none';
      }

      video.play().catch(err => console.warn('Playback failed:', err));
    }

    placeholder.addEventListener('click', start);

    video.addEventListener('click', () => {
      const playBtn = wrapper.querySelector('.ctrl-playpause');
      if (playBtn) togglePlayPause(wrapper, video, playBtn);
    });
  });

});


// ── Expandable Cards ──

const btns = document.querySelectorAll('.exp-card-btn');
btns.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var targetId = btn.getAttribute('data-exp-target');
    var panel = document.getElementById(targetId);
    var isOpen = btn.classList.contains('exp-active');
    btns.forEach(function (b) {
      b.classList.remove('exp-active');
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.exp-panel').forEach(function (p) {
      p.classList.remove('exp-open');
    });
    if (!isOpen && panel) {
      btn.classList.add('exp-active');
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('exp-open');
      if (!btn.hasAttribute('data-auto-open')) {
        setTimeout(function () {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    }
  });
});

if (btns.length) {
  btns[0].setAttribute('data-auto-open', '');
  btns[0].click();
  btns[0].removeAttribute('data-auto-open');
}

// ── Expandable Giveaway Cards ──

const giveawayBtns = document.querySelectorAll('.expandable-giveaway-card-btn');
giveawayBtns.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var targetId = btn.getAttribute('data-giveaway-target');
    var panel = document.getElementById(targetId);
    var isOpen = btn.classList.contains('expandable-giveaway-active');
    giveawayBtns.forEach(function (b) {
      b.classList.remove('expandable-giveaway-active');
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.expandable-giveaway-panel').forEach(function (p) {
      p.classList.remove('expandable-giveaway-open');
    });
    if (!isOpen && panel) {
      btn.classList.add('expandable-giveaway-active');
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('expandable-giveaway-open');
      if (!btn.hasAttribute('data-auto-open')) {
        setTimeout(function () {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    }
  });
});

if (giveawayBtns.length) {
  giveawayBtns[0].setAttribute('data-auto-open', '');
  giveawayBtns[0].click();
  giveawayBtns[0].removeAttribute('data-auto-open');
}


  // ─── Video Player Helpers ───

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function showIconFlash(wrapper, type) {
    const existing = wrapper.querySelector('.video-icon-flash');
    if (existing) existing.remove();

    const flash = document.createElement('div');
    flash.className = 'video-icon-flash';
    flash.innerHTML = type === 'play'
      ? '<div class="icon-play"></div>'
      : '<div class="icon-pause"><span></span><span></span></div>';
    wrapper.appendChild(flash);

    requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.add('show')));

    setTimeout(() => {
      flash.classList.remove('show');
      flash.addEventListener('transitionend', () => flash.remove(), { once: true });
    }, 600);
  }

  function buildControls(wrapper, video) {
    const controls = document.createElement('div');
    controls.className = 'video-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'ctrl-btn ctrl-playpause';
    playBtn.setAttribute('aria-label', 'Pause');
    playBtn.innerHTML = `
      <svg class="icon-pause-ctrl" viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
      <svg class="icon-play-ctrl" viewBox="0 0 24 24" style="display:none"><polygon points="5,3 19,12 5,21"/></svg>`;

    const progress = document.createElement('div');
    progress.className = 'video-progress';
    progress.setAttribute('role', 'slider');
    progress.setAttribute('aria-label', 'Seek');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-valuenow', '0');
    progress.tabIndex = 0;
    progress.style.touchAction = 'none';

    const fill = document.createElement('div');
    fill.className = 'video-progress-fill';
    const knob = document.createElement('div');
    knob.className = 'video-progress-knob';
    progress.append(fill, knob);

    const time = document.createElement('span');
    time.className = 'ctrl-time';
    time.textContent = '0:00';

    const muteBtn = document.createElement('button');
    muteBtn.className = 'ctrl-btn ctrl-mute';
    muteBtn.setAttribute('aria-label', 'Mute');
    muteBtn.innerHTML = `
      <svg class="icon-vol" viewBox="0 0 24 24" style="display:none"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15"/><path d="M15 9a5 5 0 0 1 0 6"/><path d="M18 6a9 9 0 0 1 0 12" stroke-width="0.5"/></svg>
      <svg class="icon-muted" viewBox="0 0 24 24"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15"/><line x1="15" y1="9" x2="21" y2="15"/><line x1="21" y1="9" x2="15" y2="15"/></svg>`;
    muteBtn.querySelectorAll('svg').forEach(s => { s.style.fill = 'none'; s.style.stroke = '#fff'; s.style.strokeWidth = '2'; });

    controls.append(playBtn, progress, time, muteBtn);
    wrapper.appendChild(controls);

    let scrubbing = false;
    let wasPlaying = false;
    let pendingRatio = null;
    let rafPending = false;

    function paint(ratio, seconds) {
      const pct = ratio * 100;
      fill.style.width = pct + '%';
      knob.style.left = pct + '%';
      progress.setAttribute('aria-valuenow', Math.round(pct));
      time.textContent = formatTime(seconds) + ' / ' + formatTime(video.duration || 0);
    }

    function commitSeek() {
      rafPending = false;
      if (pendingRatio === null) return;
      video.currentTime = pendingRatio * video.duration;
      pendingRatio = null;
    }

    function seekFromEvent(e) {
      if (!video.duration || !isFinite(video.duration)) return;
      const rect = progress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      pendingRatio = ratio;
      paint(ratio, ratio * video.duration);
      if (!rafPending) { rafPending = true; requestAnimationFrame(commitSeek); }
    }

    function endScrub(e) {
      if (!scrubbing) return;
      scrubbing = false;
      progress.classList.remove('is-scrubbing');
      commitSeek();
      if (e && progress.hasPointerCapture && progress.hasPointerCapture(e.pointerId)) progress.releasePointerCapture(e.pointerId);
      if (wasPlaying) video.play().catch(() => {});
    }

    progress.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      scrubbing = true;
      progress.classList.add('is-scrubbing');
      wasPlaying = !video.paused;
      video.pause();
      progress.setPointerCapture(e.pointerId);
      seekFromEvent(e);
    });

    progress.addEventListener('pointermove', e => {
      if (!scrubbing) return;
      e.preventDefault();
      seekFromEvent(e);
    });

    progress.addEventListener('pointerup', endScrub);
    progress.addEventListener('pointercancel', endScrub);
    progress.addEventListener('lostpointercapture', endScrub);
    progress.addEventListener('click', e => e.stopPropagation());

    progress.addEventListener('keydown', e => {
      if (!video.duration || !isFinite(video.duration)) return;
      let t = video.currentTime;
      if (e.key === 'ArrowLeft') t -= 5;
      else if (e.key === 'ArrowRight') t += 5;
      else if (e.key === 'Home') t = 0;
      else if (e.key === 'End') t = video.duration;
      else return;
      e.preventDefault();
      e.stopPropagation();
      video.currentTime = Math.max(0, Math.min(t, video.duration));
    });

    video.addEventListener('loadedmetadata', () => paint(0, 0));

    video.addEventListener('timeupdate', () => {
      if (scrubbing || !video.duration) return;
      paint(video.currentTime / video.duration, video.currentTime);
    });

    playBtn.addEventListener('click', e => {
      e.stopPropagation();
      togglePlayPause(wrapper, video, playBtn);
    });

    muteBtn.addEventListener('click', e => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.querySelector('.icon-vol').style.display = video.muted ? 'none' : '';
      muteBtn.querySelector('.icon-muted').style.display = video.muted ? '' : 'none';
    });

    video.addEventListener('play', () => updatePlayBtn(playBtn, false));
    video.addEventListener('pause', () => updatePlayBtn(playBtn, true));

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      paint(0, 0);
      updatePlayBtn(playBtn, true);
    });
  }

  function updatePlayBtn(btn, isPaused) {
    btn.querySelector('.icon-pause-ctrl').style.display = isPaused ? 'none' : '';
    btn.querySelector('.icon-play-ctrl').style.display = isPaused ? '' : 'none';
    btn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');

    const wrapper = btn.closest('.video-wrapper');
    if (wrapper) wrapper.classList.toggle('is-paused', isPaused);
  }

  function togglePlayPause(wrapper, video, playBtn) {
    if (video.paused || video.ended) {
      video.play().catch(err => console.warn('Playback failed:', err));
      showIconFlash(wrapper, 'play');
    } else {
      video.pause();
      showIconFlash(wrapper, 'pause');
    }
  }


(function () {


// ─── Brand Logos ───

const brandLogos = {
  "Bosch": "/media/news-and-inspiration/bosch.svg",
  "DeWALT": "/media/news-and-inspiration/dewalt.svg",
  "Draper": "/media/news-and-inspiration/draper.svg",
  "Laserliner": "/media/news-and-inspiration/laserliner.svg",
  "Makita": "/media/news-and-inspiration/makita.svg",
  "Paslode": "/media/news-and-inspiration/paslode.svg",
  "Senco": "/media/news-and-inspiration/senco.svg"
};

// ─── Product Data ───

const productsMap = {
  "products": {
    "name": "Products",
    "categories": [
      { "name": "DTD173ZJX2 18V Impact Driver, Bit Set & Case", "brand": "Makita", "img": "/media/catalog/product/b/5/b5200834-makita-dtd173zjx2-18v-lxt-brushless-impact-driver-38-piece-e-26179-impact-bit-set-and-makpac-case.jpg", "href": "/makita-dtd173zjx2-18v-lxt-brushless-impact-driver-38piece-e26179-impact-bit-set-makpac-case", "price": 79.00 },
      { "name": "DCK266P2T 18V Brushless Twin Kit, Batteries, Charger & Case", "brand": "DeWALT", "img": "/media/catalog/product/b/5/b5200680-dewalt-dck266p2t-18v-xr-brushless-twin-kit-cw-2-x-5ah-batteries-charger-and-carry-case.jpg", "href": "/dewalt-dck266p2t-18v-xr-brushless-twin-kit-cw-2-x-5ah-batteries-charger-carry-case", "price": 186.99 },
      { "name": "IM360Xi First-Fix Framing Nailer & Batteries", "brand": "Paslode", "img": "/media/catalog/product/b/5/b5050609-paslode-im360xi-fuel-injection-li-ion-1st-fix-gas-framing-nailer-cw-1-battery.jpg", "href": "/paslode-im360xi-fuel-injection-liion-1st-fix-gas-framing-nailer-cw-1-battery", "price": 320.50 },
      { "name": "GDR 18V-215 Impact Driver, 5Ah Batteries, Charger & L-Case", "brand": "Bosch", "img": "/media/catalog/product/b/5/b5400612-bosch-professional-gdr-18v-215-impact-driver-inc-2-x-5p0ah-gba-gal-18v-40-and-l-case.jpg", "href": "/bosch-professional-gdr-18v215-impact-driver-inc-2-x-50ah-gba-gal-18v40-lcase", "price": 147.82 },
      { "name": "DHP490Z 18V Brushless Combi Drill", "brand": "Makita", "img": "/media/catalog/product/b/5/b5200769-makita-dhp490z-18v-lxt-brushless-combi-drill-body-only.jpg", "href": "/makita-dhp490z-18v-lxt-brushless-combi-drill-body-only", "price": 57.50 },
      { "name": "GO 3.6V Screwdriver inc. Bit Set", "brand": "Bosch", "img": "/media/catalog/product/b/o/bosch-go-3rd-generation-3-6v-screwdriver-inc-bit-set-1.jpg", "href": "/bosch-go-3rd-generation-3-6v-screwdriver", "price": 39.69 },
      { "name": "F-16XP Fusion Gen 2 16g Finish Nailer & 2Ah Batteries", "brand": "Senco", "img": "/media/catalog/product/b/5/b5200592-senco-f-16xp-fusion-gen-2-16g-cordless-finish-nailer-cw-2x2ah-batteries.jpg", "href": "/senco-f16xp-fusion-gen-2-16g-cordless-finish-nailer-cw-2-x-2ah-batteries", "price": 345.45 },
      { "name": "DTM53Z 18V Brushless Multi Tool", "brand": "Makita", "img": "https://www.cwberry.com/media/catalog/product/b/5/b5200791-makita-dtm53-18v-lxt-brushless-multi-tool-body-only.jpeg", "href": "/makita-dtm53z-18v-lxt-brushless-multi-tool-body-only", "price": 110.00 },
      { "name": "GSB 18V-65 Combi Drill, ProCORE 4Ah Batteries, Charger & L-BOXX", "brand": "Bosch", "img": "/media/catalog/product/b/5/b5200555-bosch-gsb-18v-65-combi-drill-inc-2x-procore-18v-40ah-gal-18v-40-and-l-boxx.jpg", "href": "/bosch-gsb-18v65-combi-drill-inc-2-x-procore-18v-40ah-gal-18v40-lboxx", "price": 159.00 },
      { "name": "IM65 F16 Finish Nailer & Batteries", "brand": "Paslode", "img": "/media/catalog/product/b/5/b5050650-paslode-im65-f16-li-ion-16g-gas-brad-nailer-cw-1-battery.jpg", "href": "/paslode-im65-f16-liion-16g-gas-brad-nailer-cw-1-battery", "price": 305.34 },
      { "name": "F-35XP Fusion 2.0 Framing Nailer & 4Ah Batteries", "brand": "Senco", "img": "/media/catalog/product/b/5/b5200593-senco-f-35xp-fusion-2p0-cordless-framing-nailer-cw-2x4ah-batteries.jpg", "href": "/senco-f35xp-fusion-20-cordless-framing-nailer-cw-2-x-4ah-batteries", "price": 387.45 },
      { "name": "0615A5008E 18V Twin Kit, 4Ah Batteries & Charger", "brand": "Bosch", "img": "/media/catalog/product/b/5/b5200689-bosch-0615a5008e-18v-gsb-18v-65-combi-drill-and-gdx-18v-285-impact-driver-cw-2_4ah-batteries-and-charger.jpg", "href": "/bosch-0615a5008e-18v-gsb-18v65-combi-drill-gdx-18v285-impact-driver-cw-2-4ah-batteries-charger", "price": 184.32 },
      { "name": "98676 230V 135 Bar Pressure Washer", "brand": "Draper", "img": "/media/catalog/product/b/5/b5160158-draper-98676-230v-135-bar-pressure-washer.jpg", "href": "/draper-98676-230v-pressure-washer-135-bar", "price": 59.99 },
      { "name": "IM65A F16 Angled Finish Nailer & Batteries", "brand": "Paslode", "img": "/media/catalog/product/b/5/b5050652-paslode-im65a-f16-li-ion-16g-angled-gas-brad-nailer-cw-1-battery.jpg", "href": "/paslode-im65a-f16-liion-16g-angled-gas-brad-nailer-cw-1-battery", "price": 305.34 },
      { "name": "GOP 18V-34 Starlock Multi Cutter in L-BOXX", "brand": "Bosch", "img": "/media/catalog/product/b/o/bosch-06018g2000-gop-18v-34-brushless-starlock-multi-cutter-in-l-boxx.jpg", "href": "/bosch-06018g2000-gop-18v34-brushless-starlock-multi-cutter-in-lboxx", "price": 137.10 },
      { "name": "GSB 18V-65 Combi Drill, 5Ah Batteries, Charger & L-BOXX", "brand": "Bosch", "img": "/media/catalog/product/b/5/b5400541-bosch-gsb-18v-65-combi-drill-incp-2x-gba-5p0ah-gal-18v-40-and-l-boxx.jpg", "href": "/bosch-gsb-18v65-combi-drill-inc-2x-gba-50ah-gal-18v40-lboxx", "price": 149.00 },
      { "name": "PocketPlane-Laser 3G 150cm Set", "brand": "Laserliner", "img": "/media/catalog/product/l/a/laserliner-pocketplane-laser-3g-set-150-cm-2.jpg", "href": "/laserliner-pocketplanelaser-3g-150cm-set", "price": 205.00 },
      { "name": "Duraspin DS522 Auto-Feed Screwdriver & 3Ah Batteries", "brand": "Senco", "img": "/media/catalog/product/b/5/b5200261-senco-duraspin-ds522-cordless-auto-feed-screwdriver-25-55mm.jpg", "href": "/senco-duraspin-ds522-cordless-autofeed-screwdriver-2555mm-cw-2-batteries", "price": 313.95 }
    ]
  }
};

  // ─── Product Carousel ───

function initializeProductCarousel() {
    let products = Object.keys(productsMap);
    const carousels = [];
    const prevButtons = [];
    const nextButtons = [];
    const carouselContainers = [];
    const carouselIndexMap = {};

    products = products.filter(material => {
      const exists = productsMap[material] && document.getElementById('product-carousel-section');
      if (!exists) console.warn(`Carousel for ${material} not found or missing in productsMap`);
      return exists;
    });

    products.forEach((material) => {
      const section = document.getElementById('product-carousel-section');
      if (!section) return;

      const carousel = section.querySelector('.product-carousel');
      const container = section.querySelector('.product-carousel-container');
      const prevBtnSide = section.querySelector('#CarouselPrevBtn');
      const nextBtnSide = section.querySelector('#CarouselNextBtn');
      const prevBtnBottom = section.querySelector('.carousel-bottom-buttons .prevBtn');
      const nextBtnBottom = section.querySelector('.carousel-bottom-buttons .nextBtn');

      if (!carousel || !container) return;

      carousels.push(carousel);
      carouselContainers.push(container);
      carouselIndexMap[material] = 0;
      prevButtons.push({ side: prevBtnSide, bottom: prevBtnBottom });
      nextButtons.push({ side: nextBtnSide, bottom: nextBtnBottom });

      carousel.innerHTML = '';

      const category = productsMap[material];
      const uniqueProducts = category.categories.filter(
        (product, idx, self) => idx === self.findIndex(p => p.href === product.href)
      );

      uniqueProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-carousel-item';

        const priceCircle = (product.price != null && product.price !== '') ? `
            <div class="carousel-price-circle" x-data="{ basePrice: ${product.price} }">
              <span class="cpc-only">Only</span>
              <span class="cpc-price" x-text="'£' + ($store.vatSwitch.state ? (basePrice * 1.20) : basePrice).toFixed(2)">£${Number(product.price).toFixed(2)}</span>
              <span class="cpc-vat" x-text="$store.vatSwitch.state ? 'inc. VAT' : 'ex. VAT'">ex. VAT</span>
            </div>` : '';

        const brandLogo = (product.brand && brandLogos[product.brand]) ? `
              <img src="${brandLogos[product.brand]}" alt="${product.brand}" title="${product.brand}" class="product-carousel-item-brand-logo">` : '';

        item.innerHTML = `
          <div class="product-carousel-item-content w-full" style="position: relative;">
            ${priceCircle}
            <img src="${product.img}" alt="${product.name}" title="${product.name}" class="product-carousel-item-image">
            <div class="product-carousel-item-details w-full">${brandLogo}
              <div class="flex flex-row items-center gap-4 justify-start" style="padding: 0px; min-height: 50px;">
                <p class="truncate-2-lines text-base pb-2 mx-auto text-center w-4/5" style="font-weight: 700!important;">${product.name}</p>
              </div>
              <div class="pt-2 pb-2 flex z-50 deals-view-now" style="margin: 0 auto;">
                <a href="${product.href}" class="py-2 w-full deals-view-now-btn justify-center text-sm rounded uppercase font-bold focus:border-primary focus:outline-none focus:ring-0 mr-auto" aria-label="VIEW NOW">
<svg class="w-5 h-auto flex-shrink-0" xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="261 175 105 105" aria-label="Saw Blade Icon">
  <g id="sawblade-spin">
    <path d="M359.7,244.2l-3.8-3.9-1-1.1c-.6-.8-.7-1.9,0-2.7.5-.7,1.4-1,2.2-.9l1.4.3,6.9,2s-1.2-14.8-1.4-16.6c-.2-1.8-2-2.2-2-2.2l-5.3-1.5-1.4-.5c-.9-.3-1.5-1.3-1.4-2.3,0-.9.7-1.6,1.4-1.9l1.4-.4,7-1.7s-8.4-12.2-9.5-13.7c-1.1-1.4-2.9-.9-2.9-.9l-5.3,1.3-1.5.3c-1,.2-2-.3-2.4-1.3-.4-.8-.2-1.7.3-2.3l1-1,5.2-5s-13.4-6.4-15.1-7.1c-1.7-.7-2.9.7-2.9.7l-3.9,3.8-1.1,1c-.8.6-1.9.7-2.7,0-.7-.5-1-1.4-.9-2.2l.3-1.4,2-6.9s-14.8,1.2-16.6,1.4c-1.8.2-2.2,2-2.2,2l-1.5,5.3-.5,1.4c-.3.9-1.3,1.5-2.3,1.4-.9,0-1.6-.7-1.9-1.4l-.4-1.4-1.7-7s-12.2,8.4-13.7,9.5c-1.4,1.1-.9,2.9-.9,2.9l1.3,5.3.3,1.5c.2,1-.3,2-1.3,2.4-.8.4-1.7.2-2.3-.3l-1-1-5-5.2s-6.4,13.4-7.1,15.1c-.7,1.7.7,2.9.7,2.9l3.8,3.9,1,1.1c.6.8.7,1.9,0,2.7-.5.7-1.4,1-2.2.9l-1.4-.3-6.9-2s1.2,14.8,1.4,16.6c.2,1.8,2,2.2,2,2.2l5.3,1.5,1.4.5c.9.3,1.5,1.3,1.4,2.3,0,.9-.6,1.6-1.4,1.9l-1.4.4-7,1.7s8.4,12.2,9.5,13.7c1.1,1.4,2.9.9,2.9.9l5.3-1.3,1.5-.3c1-.2,2,.3,2.4,1.3.4.8.2,1.7-.3,2.3l-1,1-5.2,5s13.4,6.4,15.1,7.1,2.9-.7,2.9-.7l3.9-3.8,1.1-1c.8-.6,1.9-.7,2.7,0,.7.5,1,1.4.9,2.2l-.3,1.4-2,6.9s14.8-1.2,16.6-1.4c1.8-.2,2.2-2,2.2-2l1.5-5.3.5-1.4c.3-.9,1.3-1.5,2.3-1.4.9,0,1.6.7,1.9,1.4l.4,1.4,1.7,7s12.2-8.4,13.7-9.5.9-2.9.9-2.9l-1.3-5.3-.3-1.5c-.2-1,.3-2,1.3-2.4.8-.4,1.7-.2,2.3.3l1,1,5,5.2s6.4-13.4,7.1-15.1c.7-1.7-.7-2.9-.7-2.9h0ZM313.8,243.8c-8.9,0-16.1-7.2-16.1-16.1s7.2-16.1,16.1-16.1,16.1,7.2,16.1,16.1-7.2,16.1-16.1,16.1Z" fill="#fff"></path>
  </g>
</svg>
                  <span class="ml-2 inline text-nowrap">VIEW NOW</span>
                </a>
              </div>
            </div>
          </div>`;

        carousel.appendChild(item);
      });

      if (uniqueProducts.length <= 1) {
        [prevBtnSide, nextBtnSide, prevBtnBottom, nextBtnBottom].forEach(btn => btn?.classList.add('hidden'));
      }
    });

    if (window.Alpine && typeof window.Alpine.initTree === 'function') {
      carousels.forEach(carousel => {
        carousel.querySelectorAll('[x-data]').forEach(el => {
          if (!el._x_dataStack) window.Alpine.initTree(el);
        });
      });
    }

    function getVisibleItems() {
      if (window.innerWidth <= 350) return 1.1;
      if (window.innerWidth <= 600) return 1.3;
      if (window.innerWidth <= 880) return 2;
      if (window.innerWidth <= 1280) return 3;
      return 4;
    }

    function getMaxIndex(material) {
      const uniqueCount = productsMap[material].categories.filter(
        (product, idx, self) => idx === self.findIndex(p => p.href === product.href)
      ).length;
      return Math.max(uniqueCount - getVisibleItems(), 0);
    }

    function updateCarousel(material) {
      const idx = products.indexOf(material);
      const carousel = carousels[idx];
      if (!carousel) return;

      const items = carousel.querySelectorAll('.product-carousel-item');
      if (!items.length) return;

      const visibleItems = getVisibleItems();
      const maxIndex = getMaxIndex(material);
      carouselIndexMap[material] = Math.max(0, Math.min(carouselIndexMap[material], maxIndex));

      const itemWidthPercent = 100 / visibleItems;
      items.forEach(item => {
        item.style.flex = `0 0 ${itemWidthPercent}%`;
        item.style.maxWidth = `${itemWidthPercent}%`;
      });

      const itemWidthPx = items[0].getBoundingClientRect().width;
      const totalWidth = itemWidthPx * items.length;
      const containerWidth = carousel.parentElement.getBoundingClientRect().width;
      const maxTranslate = Math.max(totalWidth - containerWidth, 0);
      const translateX = Math.max(0, Math.min(Math.round(carouselIndexMap[material] * itemWidthPx), maxTranslate));

      carousel.style.transform = `translateX(-${translateX}px)`;
    }

    function nextProduct(material) {
      const maxIndex = getMaxIndex(material);
      if (carouselIndexMap[material] < maxIndex) {
        carouselIndexMap[material] = Math.min(carouselIndexMap[material] + 1, maxIndex);
        updateCarousel(material);
      }
    }

    function prevProduct(material) {
      if (carouselIndexMap[material] > 0) {
        carouselIndexMap[material] = Math.max(carouselIndexMap[material] - 1, 0);
        updateCarousel(material);
      }
    }

    products.forEach((material, index) => {
      const prevBtns = prevButtons[index];
      const nextBtns = nextButtons[index];
      const carouselContainer = carouselContainers[index];

      prevBtns.side?.addEventListener('click', (e) => { e.preventDefault(); prevProduct(material); });
      nextBtns.side?.addEventListener('click', (e) => { e.preventDefault(); nextProduct(material); });
      prevBtns.bottom?.addEventListener('click', (e) => { e.preventDefault(); prevProduct(material); });
      nextBtns.bottom?.addEventListener('click', (e) => { e.preventDefault(); nextProduct(material); });

      if (carouselContainer) {
        let touchStartX = 0;
        let touchStartTime = 0;
        let isSwiping = false;
        let hasMoved = false;

        carouselContainer.addEventListener('touchstart', e => {
          touchStartX = e.touches[0].clientX;
          touchStartTime = Date.now();
          isSwiping = false;
          hasMoved = false;
        });

        carouselContainer.addEventListener('touchmove', e => {
          hasMoved = true;
          if (isSwiping) { e.preventDefault(); return; }

          const swipeDistance = touchStartX - e.touches[0].clientX;
          const swipeThreshold = window.innerWidth * 0.25;
          const maxIndex = getMaxIndex(material);
          const currentIndex = carouselIndexMap[material];

          if ((swipeDistance > 0 && currentIndex >= maxIndex) || (swipeDistance < 0 && currentIndex <= 0)) {
            e.preventDefault(); return;
          }

          if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && currentIndex < maxIndex) {
              isSwiping = true; e.preventDefault(); nextProduct(material);
            } else if (swipeDistance < 0 && currentIndex > 0) {
              isSwiping = true; e.preventDefault(); prevProduct(material);
            }
          }
        }, { passive: false });

        carouselContainer.addEventListener('touchend', e => {
          if (!hasMoved) { isSwiping = false; return; }

          const swipeDistance = touchStartX - e.changedTouches[0].clientX;
          const swipeTime = Date.now() - touchStartTime;
          const maxIndex = getMaxIndex(material);
          const currentIndex = carouselIndexMap[material];

          if (!isSwiping && Math.abs(swipeDistance) > 50 && swipeTime < 300) {
            if (swipeDistance > 0 && currentIndex < maxIndex) nextProduct(material);
            else if (swipeDistance < 0 && currentIndex > 0) prevProduct(material);
          }

          setTimeout(() => {
            carouselIndexMap[material] = Math.max(0, Math.min(carouselIndexMap[material], getMaxIndex(material)));
            updateCarousel(material);
          }, 100);

          isSwiping = false;
          hasMoved = false;
        });

        carouselContainer.style.touchAction = 'pan-y pinch-zoom';
      }
    });

    window.addEventListener('resize', () => products.forEach(material => updateCarousel(material)));
    products.forEach(material => updateCarousel(material));
  }

  // ─── DOMContentLoaded ───

  document.addEventListener('DOMContentLoaded', function () {
    initializeProductCarousel();
  });

})();
