/* ==========================================================================
   META ADS CRASH COURSE 2026 - PDP APPLICATION LOGIC
   Gallery Switching, 3D Tilt, Edition Selection, Checkout & Instant PDF Delivery
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  init3DTilt();
  initGalleryTabs();
  initBuyButton();
  initAccordions();
  initCountdownTimer();
  initSocialProofToasts();
  initCheckoutModal();
});

/* ==========================================================================
   1. 3D TACTILE TILT ON PRODUCT MEDIA
   ========================================================================== */
function init3DTilt() {
  const scene = document.getElementById('product3dScene');
  const book = document.getElementById('book3d');
  const shadow = document.getElementById('bookShadow');
  const gloss = document.querySelector('.book-gloss-overlay');
  const badge1 = document.querySelector('.badge-top-right');
  const badge2 = document.querySelector('.badge-bottom-left');

  if (!scene || !book) return;

  // Enable touch interaction on mobile / touch screens
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let touchStartX = 0;
    let touchStartY = 0;

    scene.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    scene.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        const rotY = -18 + deltaX * 0.35;
        const rotX = Math.max(-15, Math.min(20, 8 - deltaY * 0.25));
        book.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    }, { passive: true });

    scene.addEventListener('touchend', () => {
      book.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      book.style.transform = 'rotateY(-18deg) rotateX(8deg) scale3d(1, 1, 1)';
      setTimeout(() => {
        book.style.transition = '';
      }, 350);
    });
    return;
  }

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = 10 + ((y - centerY) / centerY) * -15;
    const rotateY = -24 + ((x - centerX) / centerX) * 22;

    book.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    if (shadow) {
      shadow.style.transform = `translateX(-46%) rotateX(65deg) rotateZ(${-rotateY * 0.3}deg) translateZ(-40px)`;
    }

    if (gloss) {
      const glossX = (x / rect.width) * 100;
      const glossY = (y / rect.height) * 100;
      gloss.style.background = `radial-gradient(circle at ${glossX}% ${glossY}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.04) 50%, transparent 80%)`;
    }

    if (badge1) {
      badge1.style.transform = `translate3d(${-rotateY * 0.5}px, ${-rotateX * 0.5}px, 45px)`;
    }
    if (badge2) {
      badge2.style.transform = `translate3d(${-rotateY * 0.4}px, ${-rotateX * 0.4}px, 50px)`;
    }
  });

  scene.addEventListener('mouseleave', () => {
    book.style.transform = 'rotateY(-24deg) rotateX(10deg) scale3d(1, 1, 1)';
    if (shadow) {
      shadow.style.transform = 'translateX(-46%) rotateX(65deg) translateZ(-40px)';
    }
    if (gloss) {
      gloss.style.background = 'linear-gradient(115deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)';
    }
    if (badge1) {
      badge1.style.transform = 'translateZ(0)';
    }
    if (badge2) {
      badge2.style.transform = 'translateZ(0)';
    }
  });
}

/* ==========================================================================
   2. GALLERY SWITCHER (3D BOOK, BUNDLE, SAMPLE PREVIEW)
   ========================================================================== */
function initGalleryTabs() {
  const thumbButtons = document.querySelectorAll('.thumb-btn');
  const mediaViews = document.querySelectorAll('.media-view');

  function switchView(targetId) {
    thumbButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
    });

    mediaViews.forEach(view => {
      view.classList.toggle('active', view.id === targetId);
    });
  }

  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchView(target);
    });
  });
}

/* ==========================================================================
   3. BUY BUTTON & CHECKOUT TRIGGER
   ========================================================================== */
function initBuyButton() {
  const buyBtn = document.getElementById('pdpBuyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCheckout();
    });
  }
}

/* ==========================================================================
   4. ACCORDION LOGIC
   ========================================================================== */
function initAccordions() {
  const items = document.querySelectorAll('.pdp-acc-item');

  items.forEach(item => {
    const header = item.querySelector('.pdp-acc-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

/* ==========================================================================
   5. COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  const timerElements = document.querySelectorAll('.countdown-timer');
  if (timerElements.length === 0) return;

  let totalSeconds = 2 * 3600 + 44 * 60 + 19;
  const saved = sessionStorage.getItem('meta_ads_deal_timer');
  if (saved) totalSeconds = parseInt(saved, 10);

  function tick() {
    if (totalSeconds > 0) {
      totalSeconds--;
      sessionStorage.setItem('meta_ads_deal_timer', totalSeconds.toString());
    } else {
      totalSeconds = 3600 * 3;
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timerElements.forEach(el => el.textContent = formatted);
  }

  tick();
  setInterval(tick, 1000);
}

/* ==========================================================================
   6. REAL-TIME SOCIAL PROOF TOAST ENGINE
   ========================================================================== */
const recentBuyers = [
  { name: 'Sarah K.', location: 'Austin, TX', time: '2m ago' },
  { name: 'Liam D.', location: 'London, UK', time: '5m ago' },
  { name: 'Julian M.', location: 'Toronto, Canada', time: '8m ago' },
  { name: 'Elena R.', location: 'Berlin, Germany', time: '12m ago' },
  { name: 'Marcus B.', location: 'Sydney, Australia', time: '17m ago' }
];

function initSocialProofToasts() {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  let buyerIdx = 0;

  function showToast() {
    const buyer = recentBuyers[buyerIdx];
    buyerIdx = (buyerIdx + 1) % recentBuyers.length;

    const toast = document.createElement('div');
    toast.className = 'social-toast';
    toast.innerHTML = `
      <div class="toast-avatar">${buyer.name.charAt(0)}</div>
      <div class="toast-info">
        <div class="toast-msg">${buyer.name} from ${buyer.location} bought <strong>Meta Ads Crash Course (PDF)</strong></div>
        <div class="toast-time">⚡ ${buyer.time} • Verified Buyer</div>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  setTimeout(showToast, 3500);
  setInterval(showToast, 12000);
}

/* ==========================================================================
   7. CHECKOUT MODAL & INSTANT PDF DOWNLOAD
   ========================================================================== */
function openCheckout() {
  const modal = document.getElementById('checkoutModal');
  const formContent = document.getElementById('modalFormContent');
  const successBox = document.getElementById('modalSuccessBox');

  if (formContent) formContent.style.display = 'block';
  if (successBox) successBox.style.display = 'none';

  if (modal) modal.classList.add('active');

  // Meta Pixel InitiateCheckout Event Tracking
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Mastering Facebook Ads (28-Page PDF Playbook)',
      value: 249.00,
      currency: 'INR'
    });
  }
}

function initCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('checkoutForm');
  const formContent = document.getElementById('modalFormContent');
  const successBox = document.getElementById('modalSuccessBox');
  const downloadBtn = document.getElementById('downloadSamplePdfBtn');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('paySubmitBtn') || form.querySelector('button[type="submit"]');

      const name = (document.getElementById('checkoutName')?.value || '').trim();
      const phone = (document.getElementById('checkoutPhone')?.value || '').trim();
      const email = (document.getElementById('checkoutEmail')?.value || '').trim();

      if (!name || !phone) {
        alert('Please provide your Name and Mobile Number.');
        return;
      }

      submitBtn.innerHTML = '<span>Connecting to Razorpay...</span>';
      submitBtn.disabled = true;

      try {
        // Step 1: Create Order on Server
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, number: phone, email })
        });

        let orderData;
        const resText = await orderRes.text();
        try {
          orderData = JSON.parse(resText);
        } catch (parseErr) {
          console.error('Non-JSON response from /api/create-order:', resText);
          throw new Error('Server busy or updating. Please try again in a moment.');
        }

        if (!orderRes.ok || !orderData.success || !orderData.order_id) {
          throw new Error(orderData.error || 'Unable to generate Razorpay order ID');
        }

        // Step 2: Launch Razorpay Modal
        const options = {
          key: orderData.key_id || 'rzp_live_TbXpMHWLFUG29I',
          amount: orderData.amount || 24900,
          currency: orderData.currency || 'INR',
          name: 'Meta Ads Store',
          description: 'Mastering Facebook Ads (28-Page PDF Playbook)',
          image: 'assets/favicon.svg',
          order_id: orderData.order_id,
          prefill: {
            name: name,
            contact: phone,
            email: email || ''
          },
          theme: {
            color: '#0081fb'
          },
          handler: async function (response) {
            submitBtn.innerHTML = '<span>Verifying Payment...</span>';

            try {
              // Step 3: Verify Payment on Server
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  name: name,
                  number: phone,
                  email: email
                })
              });

              let verifyData;
              const vText = await verifyRes.text();
              try {
                verifyData = JSON.parse(vText);
              } catch (vpErr) {
                verifyData = { success: false, error: 'Verification response parsing failed' };
              }

              if (verifyData.success) {
                formContent.style.display = 'none';
                successBox.style.display = 'block';

                // Meta Pixel Purchase Event Tracking (with eventID deduplication for CAPI)
                if (typeof window.fbq === 'function') {
                  window.fbq('track', 'Purchase', {
                    content_name: 'Mastering Facebook Ads (28-Page PDF Playbook)',
                    content_category: 'E-Book / Course',
                    content_type: 'product',
                    value: 249.00,
                    currency: 'INR'
                  }, { eventID: response.razorpay_order_id });
                }

                // Redirect to dedicated /success page with verified access token
                const orderId = (verifyData.order && verifyData.order.order_id) || response.razorpay_order_id || '';
                const paymentId = response.razorpay_payment_id || '';
                const token = verifyData.access_token || '';

                sessionStorage.setItem('meta_paid_access', JSON.stringify({
                  order_id: orderId,
                  payment_id: paymentId,
                  token: token
                }));
                
                setTimeout(() => {
                  window.location.href = `/success?order_id=${encodeURIComponent(orderId)}&payment_id=${encodeURIComponent(paymentId)}&token=${encodeURIComponent(token)}`;
                }, 300);
              } else {
                alert('Payment verification failed: ' + (verifyData.error || 'Please contact support.'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>🔒 Pay ₹249 & Get Instant Download (UPI / Cards)</span>';
              }
            } catch (vErr) {
              console.error('Verification Error:', vErr);
              alert('Payment received! Please check your order details.');
            }
          },
          modal: {
            ondismiss: function () {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span>🔒 Pay ₹249 & Get Instant Download (UPI / Cards)</span>';
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failedRes) {
          alert('Payment was not completed: ' + (failedRes.error.description || 'Cancelled'));
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>🔒 Pay ₹249 & Get Instant Download (UPI / Cards)</span>';
        });
        rzp.open();

      } catch (err) {
        console.error('Razorpay Error:', err);
        alert('Could not start Razorpay: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🔒 Pay ₹249 & Get Instant Download (UPI / Cards)</span>';
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerPdfDownload();
    });
  }
}

function triggerPdfDownload() {
  const link = document.createElement('a');
  link.href = 'assets/Mastering_Facebook_Ads.pdf';
  link.download = 'Mastering_Facebook_Ads_Guide.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   8. THEME TOGGLE (LIGHT / DARK)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const toggleIcon = document.getElementById('themeToggleIcon');
  const toggleText = document.getElementById('themeToggleText');

  function updateToggleUI(theme) {
    if (!toggleIcon || !toggleText || !toggleBtn) return;
    if (theme === 'dark') {
      toggleIcon.textContent = '☀️';
      toggleText.textContent = 'Light';
      toggleBtn.setAttribute('title', 'Switch to Light theme');
    } else {
      toggleIcon.textContent = '🌙';
      toggleText.textContent = 'Dark';
      toggleBtn.setAttribute('title', 'Switch to Dark theme');
    }
  }

  // Read current theme (default is light)
  let currentTheme = localStorage.getItem('pdp_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateToggleUI(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('pdp_theme', currentTheme);
      updateToggleUI(currentTheme);
    });
  }
}

