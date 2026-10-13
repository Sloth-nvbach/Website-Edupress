const Auth = {
  currentUser: null,

  init() {
    this.currentUser = Storage.getCurrentUser();
    this.updateHeader();
    this.bindEvents();
  },

  bindEvents() {
    const loginForm = Utils.getElement('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const registerForm = Utils.getElement('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const logoutBtn = Utils.getElement('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    const avatarOptions = Utils.getElements('.avatar-option');
    avatarOptions.forEach(option => {
      option.addEventListener('click', () => {
        avatarOptions.forEach(o => Utils.removeClass(o, 'selected'));
        Utils.addClass(option, 'selected');
        const avatarInput = Utils.getElement('#avatar-input');
        if (avatarInput) avatarInput.value = option.dataset.avatar;
      });
    });

    const forgotPasswordLink = Utils.getElement('#forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.showToast('Chức năng quên mật khẩu đang phát triển', 'info');
      });
    }
  },

  updateHeader() {
    const authButtons = Utils.getElement('#auth-buttons');
    const userMenu = Utils.getElement('#user-menu');
    const userName = Utils.getElement('#user-name');
    const userAvatar = Utils.getElement('#user-avatar');

    if (this.currentUser) {
      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      if (userName) userName.textContent = this.currentUser.name;
      if (userAvatar) userAvatar.textContent = this.currentUser.avatar || Utils.getInitials(this.currentUser.name);
    } else {
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  },

  handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#remember')?.checked;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = form.querySelector('#login-error');

    this.clearErrors(form);

    if (!email || !password) {
      this.showError(form, 'login-error', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    if (!Utils.validateEmail(email)) {
      this.showError(form, 'login-error', 'Email không hợp lệ');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Đang đăng nhập...';

    const result = Storage.login(email, password);

    if (result.success) {
      this.currentUser = result.user;
      this.updateHeader();
      Utils.showToast('Đăng nhập thành công!', 'success');

      setTimeout(() => {
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
        window.location.href = redirectUrl;
      }, 1000);
    } else {
      this.showError(form, 'login-error', result.message);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Đăng nhập';
  },

  handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;
    const avatar = form.querySelector('#avatar-input')?.value || '👤';
    const submitBtn = form.querySelector('button[type="submit"]');

    this.clearErrors(form);

    if (!name || !email || !password || !confirmPassword) {
      this.showError(form, 'register-error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!Utils.validateEmail(email)) {
      this.showError(form, 'register-error', 'Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      this.showError(form, 'register-error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      this.showError(form, 'register-error', 'Mật khẩu xác nhận không khớp');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Đang đăng ký...';

    const result = Storage.register({ name, email, password, avatar });

    if (result.success) {
      this.currentUser = result.user;
      this.updateHeader();
      Utils.showToast('Đăng ký thành công!', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      this.showError(form, 'register-error', result.message);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Đăng ký';
  },

  logout() {
    Storage.logout();
    this.currentUser = null;
    this.updateHeader();
    Utils.showToast('Đã đăng xuất', 'info');

    const publicPages = ['index.html', 'courses.html', 'sponsors.html', 'login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (!publicPages.includes(currentPage)) {
      window.location.href = 'index.html';
    }
  },

  requireAuth(redirect = true) {
    if (!Storage.isLoggedIn()) {
      if (redirect) {
        const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
      }
      return false;
    }
    this.currentUser = Storage.getCurrentUser();
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!Storage.isAdmin()) {
      Utils.showToast('Bạn không có quyền truy cập', 'error');
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  },

  showError(form, errorId, message) {
    const errorDiv = form.querySelector(`#${errorId}`);
    const input = form.querySelector('input:invalid, input[aria-invalid="true"]');

    if (errorDiv) {
      errorDiv.textContent = message;
      Utils.addClass(errorDiv, 'show');
    }

    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  },

  clearErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      Utils.removeClass(el, 'show');
    });
    form.querySelectorAll('input[aria-invalid="true"]').forEach(el => {
      el.removeAttribute('aria-invalid');
    });
  },

  updateProfile(userData) {
    if (!this.currentUser) return null;

    const updated = Storage.updateUser(this.currentUser.id, userData);
    if (updated) {
      this.currentUser = updated;
      this.updateHeader();
      Utils.showToast('Cập nhật hồ sơ thành công', 'success');
    }
    return updated;
  },

  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) return { success: false, message: 'Chưa đăng nhập' };

    if (this.currentUser.password !== currentPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
    }

    const updated = Storage.updateUser(this.currentUser.id, { password: newPassword });
    if (updated) {
      this.currentUser = updated;
      Utils.showToast('Đổi mật khẩu thành công', 'success');
      return { success: true };
    }

    return { success: false, message: 'Có lỗi xảy ra' };
  }
};

window.Auth = Auth;