(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DESKTOP = '(min-width: 721px)';

    /* ============================================================
       Mobile menu
       ============================================================ */
    var toggle = document.querySelector('.site-nav__toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    function setMenu(open) {
        if (!toggle || !mobileMenu) return;
        mobileMenu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });

        // Close after following an in-page link
        mobileMenu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setMenu(false);
        });

        // Escape closes and returns focus to the control that opened it
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (toggle.getAttribute('aria-expanded') !== 'true') return;
            setMenu(false);
            toggle.focus();
        });

        // Click outside closes
        document.addEventListener('click', function (e) {
            if (toggle.getAttribute('aria-expanded') !== 'true') return;
            if (e.target.closest('#site-nav')) return;
            setMenu(false);
        });

        // Don't leave an orphaned open menu behind when growing to desktop
        window.matchMedia(DESKTOP).addEventListener('change', function (e) {
            if (e.matches) setMenu(false);
        });
    }

    /* ============================================================
       Back to top
       ============================================================ */
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        var updateBackToTop = function () {
            backToTop.classList.toggle('is-visible', window.scrollY > 600);
        };
        updateBackToTop();
        window.addEventListener('scroll', updateBackToTop, { passive: true });
    }

    /* ============================================================
       Reveal on scroll
       `html.js` (set before first paint by an inline head script)
       hides [data-reveal] until `.is-visible` lands. Setting the
       ready flag tells the head script's safety net to leave the
       gate alone; if this init throws first, the flag is never set
       and the net removes `js`, so content is never stuck hidden.
       ============================================================ */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
    window.rateableRevealReady = true;

    /* ============================================================
       Demo video
       Plays only while it is on screen, and only when the visitor
       has not asked for reduced motion. The toggle is revealed by
       JS so it is never a dead control without scripting.
       ============================================================ */
    var demoVideo = document.querySelector('video[data-autoplay]');
    if (demoVideo) {
        var videoToggle = document.querySelector('[data-video-toggle]');
        var userPaused = false;

        var setVideoState = function (playing) {
            if (!videoToggle) return;
            videoToggle.textContent = playing ? 'Pause' : 'Play';
            videoToggle.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
        };

        if (videoToggle) {
            videoToggle.hidden = false;
            videoToggle.addEventListener('click', function () {
                if (demoVideo.paused) {
                    userPaused = false;
                    demoVideo.play().catch(function () {});
                } else {
                    userPaused = true;
                    demoVideo.pause();
                }
            });
        }

        demoVideo.addEventListener('play', function () { setVideoState(true); });
        demoVideo.addEventListener('pause', function () { setVideoState(false); });

        if (reduceMotion) {
            setVideoState(false);
        } else if ('IntersectionObserver' in window) {
            var videoObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !userPaused) {
                        demoVideo.play().catch(function () {});
                    } else {
                        demoVideo.pause();
                    }
                });
            }, { threshold: 0.35 });
            videoObserver.observe(demoVideo);
        } else {
            demoVideo.play().catch(function () {});
        }
    }

    /* ============================================================
       Footer year
       ============================================================ */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ============================================================
       Copy-to-clipboard on code blocks
       ============================================================ */
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            document.body.removeChild(ta);
            ok ? resolve() : reject(new Error('copy-unavailable'));
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
        var codeEl = btn.closest('.code') ? btn.closest('.code').querySelector('pre code') : null;
        if (!codeEl) return;

        var label = btn.querySelector('span');
        var reset;

        btn.addEventListener('click', function () {
            copyText(codeEl.textContent).then(function () {
                if (label) label.textContent = 'Copied';
                btn.classList.add('is-copied');
                clearTimeout(reset);
                reset = setTimeout(function () {
                    if (label) label.textContent = 'Copy';
                    btn.classList.remove('is-copied');
                }, 2000);
            }).catch(function () {
                if (label) label.textContent = 'Press Ctrl+C';
            });
        });
    });

    /* ============================================================
       Pricing calculator
       ============================================================ */
    var calcProducts = document.getElementById('calc-products');
    var calcUsers = document.getElementById('calc-users');
    var calcQuotes = document.getElementById('calc-quotes');

    if (calcProducts && calcUsers && calcQuotes) {
        var BASE_FEE = 249;
        var INCLUDED_PRODUCTS = 1;
        var INCLUDED_USERS = 3;
        var INCLUDED_QUOTES = 50000;
        var EXTRA_PRODUCT_FEE = 95;
        var USER_BLOCK_SIZE = 5;
        var USER_BLOCK_FEE = 40;
        var PLAN_CEILING = 2000000;
        var APPROACH_QUOTES = 1600000;

        // Progressive overage bands, by overage volume (not total quotes)
        var bandStarts = [0, 200000, 950000, 4950000];
        var bandRates = [0.009, 0.0045, 0.0022, 0.0009];
        var bandLabels = ['£0.009', '£0.0045', '£0.0022', '£0.0009'];

        var money = function (n) { return '£' + Math.round(n).toLocaleString('en-GB'); };
        var count = function (n) { return Math.round(n).toLocaleString('en-GB'); };

        function quoteCost(overage) {
            var cost = 0;
            for (var i = 0; i < bandStarts.length; i++) {
                var start = bandStarts[i];
                var end = i + 1 < bandStarts.length ? bandStarts[i + 1] : Infinity;
                if (overage <= start) break;
                cost += Math.min(overage - start, end - start) * bandRates[i];
            }
            return cost;
        }

        function marginalRate(overage) {
            for (var i = bandStarts.length - 1; i >= 0; i--) {
                if (overage > bandStarts[i]) return bandLabels[i];
            }
            return bandLabels[0];
        }

        function setText(id, text) {
            var el = document.getElementById(id);
            if (el) el.textContent = text;
        }

        // Paint the filled portion of each range track
        function paintTrack(input) {
            var min = parseFloat(input.min);
            var max = parseFloat(input.max);
            var pct = max > min ? ((parseFloat(input.value) - min) / (max - min)) * 100 : 0;
            input.style.setProperty('--fill', pct.toFixed(2) + '%');
        }

        // Announce the total without spamming the live region while dragging
        var announceTimer;
        var firstRun = true;
        function announceTotal(text) {
            if (firstRun) { firstRun = false; return; }
            clearTimeout(announceTimer);
            announceTimer = setTimeout(function () {
                setText('calc-total-value', text);
            }, 350);
        }

        function update() {
            var p = Math.max(1, parseInt(calcProducts.value, 10) || 1);
            var u = Math.max(INCLUDED_USERS, parseInt(calcUsers.value, 10) || INCLUDED_USERS);
            var q = Math.max(INCLUDED_QUOTES, parseInt(calcQuotes.value, 10) || INCLUDED_QUOTES);

            var productCost = Math.max(0, p - INCLUDED_PRODUCTS) * EXTRA_PRODUCT_FEE;
            var userBlocks = Math.max(0, Math.ceil((u - INCLUDED_USERS) / USER_BLOCK_SIZE));
            var userCost = userBlocks * USER_BLOCK_FEE;
            var overage = Math.max(0, q - INCLUDED_QUOTES);
            var qCost = quoteCost(overage);
            var total = BASE_FEE + productCost + userCost + qCost;

            setText('calc-products-val', String(p));
            setText('calc-users-val', String(u));
            setText('calc-quotes-val', count(q));

            // Spoken values, not raw slider numbers
            calcProducts.setAttribute('aria-valuetext', p + (p === 1 ? ' product' : ' products'));
            calcUsers.setAttribute('aria-valuetext', u + (u === 1 ? ' user' : ' users'));
            calcQuotes.setAttribute('aria-valuetext', count(q) + ' quotes per month');

            [calcProducts, calcUsers, calcQuotes].forEach(paintTrack);

            setText('calc-product-cost', money(productCost));
            setText('calc-user-cost', money(userCost));
            setText('calc-quote-cost', money(qCost));

            var rowProducts = document.querySelector('[data-row="products"]');
            var rowUsers = document.querySelector('[data-row="users"]');
            var rowQuotes = document.querySelector('[data-row="quotes"]');
            if (rowProducts) rowProducts.hidden = productCost === 0;
            if (rowUsers) rowUsers.hidden = userCost === 0;
            if (rowQuotes) rowQuotes.hidden = qCost === 0;

            // Only describe bands the slider can actually reach
            var tier = document.getElementById('calc-tier');
            if (tier) {
                if (overage > 0) {
                    tier.hidden = false;
                    tier.textContent =
                        'Overage is billed progressively, and the rate falls as volume rises: ' +
                        '£0.009 per quote up to 200,000 of overage, then £0.0045 to 950,000, ' +
                        'then £0.0022 beyond that. At your volume the marginal rate is ' +
                        marginalRate(overage) + ' per quote.';
                } else {
                    tier.hidden = true;
                }
            }

            var hint = document.getElementById('calc-hint');
            if (hint) {
                var nearCeiling = p >= 14 || u >= 29 || q >= APPROACH_QUOTES;
                hint.hidden = !nearCeiling;
                if (nearCeiling) {
                    hint.textContent = 'Almost at the Standard ceiling. Past 14 products, ' +
                        count(PLAN_CEILING) + ' quotes a month or 29 users we scope a Custom plan — ';
                    var link = document.createElement('a');
                    link.href = '#contact';
                    link.textContent = 'talk to us';
                    hint.appendChild(link);
                }
            }

            announceTotal(money(total));
        }

        [calcProducts, calcUsers, calcQuotes].forEach(function (el) {
            el.addEventListener('input', update);
        });

        // Prime the visuals without announcing on page load
        update();
        setText('calc-total-value', money(BASE_FEE));
    }

    /* ============================================================
       Lead form
       Posts multipart/form-data to a Google Apps Script web app.
       That endpoint answers without CORS headers and cannot reply
       to a preflight, so the request has to be no-cors: a resolved
       promise only proves the POST left the browser, not that a
       row reached the sheet. See the deployment notes in README.md
       before trusting the success message.
       ============================================================ */
    var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzg890P1isxFpSuthVHji9rF01cKLgHxXBYoZI' +
        'Ang4tAyIUPWRjIevHd8nv4eDT8mCh/exec';
    var UTM_KEY = 'rateable_utm_source';

    function readQueryParam(name) {
        try {
            return new URLSearchParams(window.location.search).get(name) || '';
        } catch (err) {
            return '';
        }
    }

    // Hold the campaign on arrival so it survives a click out to another
    // page and back. sessionStorage throws on some file:// origins, hence
    // the try: the page has to keep working when opened locally.
    function cacheUtmSource(value) {
        if (!value) return;
        try { window.sessionStorage.setItem(UTM_KEY, value); } catch (err) { /* not fatal */ }
    }

    function cachedUtmSource() {
        try { return window.sessionStorage.getItem(UTM_KEY) || ''; } catch (err) { return ''; }
    }

    cacheUtmSource(readQueryParam('utm_source'));

    var form = document.getElementById('lead-form');
    if (form) {
        var submitBtn = document.getElementById('lead-submit');
        var note = document.getElementById('form-note');
        var errorBox = document.getElementById('form-error');
        var errorText = document.getElementById('form-error-text');
        var email = document.getElementById('lead-email');
        var message = document.getElementById('lead-message');

        var validEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

        var showError = function (msg) {
            if (errorText) errorText.textContent = msg;
            if (errorBox) errorBox.hidden = false;
            if (email) {
                email.setAttribute('aria-invalid', 'true');
                email.setAttribute('aria-describedby',
                    (email.getAttribute('aria-describedby') || '') + ' form-error');
            }
            if (note) { note.textContent = ''; note.className = 'form-note'; }
        };

        var clearError = function () {
            if (errorBox) errorBox.hidden = true;
            if (email) {
                email.setAttribute('aria-invalid', 'false');
                var described = (email.getAttribute('aria-describedby') || '')
                    .split(/\s+/).filter(function (id) { return id && id !== 'form-error'; });
                email.setAttribute('aria-describedby', described.join(' '));
            }
        };

        // Both outcomes of the POST land here, so the button cannot be
        // left spinning on a rejected request
        var settle = function () {
            if (submitBtn) {
                submitBtn.classList.remove('btn--loading');
                submitBtn.disabled = false;
            }
        };

        if (email) {
            email.addEventListener('input', function () {
                if (email.getAttribute('aria-invalid') === 'true' && validEmail(email.value.trim())) {
                    clearError();
                }
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var emailVal = email ? email.value.trim() : '';
            var messageVal = message ? message.value.trim() : '';

            if (!validEmail(emailVal)) {
                showError('Please enter a valid work email address, for example you@broker.co.uk.');
                if (email) email.focus();
                return;
            }
            clearError();

            if (submitBtn) {
                submitBtn.classList.add('btn--loading');
                submitBtn.disabled = true;
            }

            // Keys must match the sheet columns the Apps Script doPost reads
            var payload = new FormData();
            payload.append('email-address', emailVal);
            payload.append('details', messageVal);
            payload.append('utm_source', readQueryParam('utm_source') || cachedUtmSource());
            payload.append('referrer', document.referrer);
            payload.append('timestamp', new Date().toISOString());

            // FormData keeps this a CORS-simple request, so no preflight is
            // generated. Setting Content-Type by hand would break that.
            fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: payload }).then(function () {
                settle();
                if (note) {
                    note.className = 'form-note is-ok';
                    note.textContent = 'Thanks — we\'ll email the demo org details to ' + emailVal + '.';
                }
                form.reset();
            }).catch(function () {
                settle();
                if (note) {
                    note.className = 'form-note is-error';
                    note.textContent = 'Could not send that. Check your connection and try again.';
                }
            });
        });
    }
})();
