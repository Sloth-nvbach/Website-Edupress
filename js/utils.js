const Utils = {
  formatCurrency(amount) {
    if (amount === 0 || amount === null || amount === undefined) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  },

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  setUrlParam(key, value) {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  },

  getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  calculateDiscount(originalPrice, currentPrice) {
    if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  },

  applyPromotion(price, promotion) {
    if (!promotion || !promotion.active) return price;

    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start || now > end) return price;

    if (promotion.type === 'percent') {
      return Math.round(price * (1 - promotion.value / 100));
    } else if (promotion.type === 'fixed') {
      return Math.max(0, price - promotion.value);
    }

    return price;
  },

  isPromotionValid(promotion, courseId) {
    if (!promotion || !promotion.active) return false;

    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start || now > end) return false;

    if (promotion.courseIds && promotion.courseIds.length > 0) {
      return promotion.courseIds.includes(courseId);
    }

    return true;
  },

  getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  showModal(content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const title = options.title || 'Xác nhận';
    const confirmText = options.confirmText || 'Xác nhận';
    const cancelText = options.cancelText || 'Hủy';
    const onConfirm = options.onConfirm || (() => {});

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${this.escapeHtml(title)}</h3>
          <button class="modal-close" aria-label="Đóng">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-cancel">${this.escapeHtml(cancelText)}</button>
          <button class="btn btn-primary modal-confirm">${this.escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('show'));

    const closeModal = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    };

    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.modal-cancel').addEventListener('click', closeModal);
    overlay.querySelector('.modal-confirm').addEventListener('click', () => {
      onConfirm();
      closeModal();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });
  },

  showConfirm(message, onConfirm) {
    this.showModal(`<p>${this.escapeHtml(message)}</p>`, {
      title: 'Xác nhận',
      confirmText: 'Đồng ý',
      cancelText: 'Hủy',
      onConfirm
    });
  },

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone(phone) {
    const re = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return re.test(phone);
  },

  validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  getElement(selector) {
    return document.querySelector(selector);
  },

  getElements(selector) {
    return document.querySelectorAll(selector);
  },

  createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },

  removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  addClass(element, className) {
    if (element) element.classList.add(className);
  },

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  },

  toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  },

  hasClass(element, className) {
    return element && element.classList.contains(className);
  },

  setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },

  onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

window.Utils = Utils;