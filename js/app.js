const App = {
  init() {
    this.initHeader();
    this.initFooter();
    this.initMobileMenu();
    this.initScrollToTop();
    Storage.init();
    Auth.init();
  },

  initHeader() {
    const headerPlaceholder = Utils.getElement('#header-placeholder');
    if (!headerPlaceholder) return;

    const currentUser = Storage.getCurrentUser();
    const isLoggedIn = !!currentUser;

    headerPlaceholder.innerHTML = `
      <header class="header" role="banner">
        <div class="container header-inner">
          <a href="index.html" class="logo" aria-label="Edupress - Trang chủ">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            Edupress
          </a>

          <nav class="nav" id="main-nav" role="navigation" aria-label="Menu chính">
            <a href="index.html" class="nav-link" data-page="home">Trang chủ</a>
            <a href="courses.html" class="nav-link" data-page="courses">Khóa học</a>
            <a href="sponsors.html" class="nav-link" data-page="sponsors">Nhà tài trợ</a>
            ${isLoggedIn ? `
              <a href="dashboard.html" class="nav-link" data-page="dashboard">Bảng điều khiển</a>
            ` : ''}
          </nav>

          <div class="header-actions">
            <div id="auth-buttons" style="display: ${isLoggedIn ? 'none' : 'flex'};">
              <a href="login.html" class="btn btn-outline btn-sm">Đăng nhập</a>
              <a href="register.html" class="btn btn-primary btn-sm">Đăng ký</a>
            </div>

            <div id="user-menu" class="flex gap-12" style="display: ${isLoggedIn ? 'flex' : 'none'}; align-items: center;">
              <span id="user-name" class="font-medium">${Utils.escapeHtml(currentUser?.name || '')}</span>
              <span id="user-avatar" class="avatar-selector-btn" style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; cursor: pointer;" title="Hồ sơ">
                ${currentUser?.avatar || Utils.getInitials(currentUser?.name || 'U')}
              </span>
              <button id="logout-btn" class="btn btn-outline btn-sm">Đăng xuất</button>
            </div>

            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Mở menu" aria-expanded="false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;

    this.updateActiveNavLink();
  },

  updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageMap = {
      'index.html': 'home',
      'courses.html': 'courses',
      'course-detail.html': 'courses',
      'sponsors.html': 'sponsors',
      'dashboard.html': 'dashboard',
      'profile.html': 'dashboard',
      'learning.html': 'dashboard',
      'login.html': '',
      'register.html': '',
      'admin.html': ''
    };

    const activePage = pageMap[currentPage];
    if (activePage) {
      const activeLink = Utils.getElement(`.nav-link[data-page="${activePage}"]`);
      if (activeLink) Utils.addClass(activeLink, 'active');
    }
  },

  initFooter() {
    const footerPlaceholder = Utils.getElement('#footer-placeholder');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                  <rect width="32" height="32" rx="8" fill="currentColor"/>
                  <path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                Edupress
              </div>
              <p class="footer-desc">Nền tảng học tập trực tuyến hàng đầu Việt Nam, cung cấp các khóa học chất lượng cao từ các chuyên gia và tổ chức uy tín.</p>
            </div>

            <div>
              <h4 class="footer-title">Khóa học</h4>
              <ul class="footer-links">
                <li><a href="courses.html">Tất cả khóa học</a></li>
                <li><a href="courses.html?price=free">Khóa học miễn phí</a></li>
                <li><a href="courses.html?promotion=on-sale">Khóa học giảm giá</a></li>
                <li><a href="courses.html?category=Lập trình">Lập trình</a></li>
                <li><a href="courses.html?category=Thiết kế">Thiết kế</a></li>
              </ul>
            </div>

            <div>
              <h4 class="footer-title">Hỗ trợ</h4>
              <ul class="footer-links">
                <li><a href="#">Trung tâm trợ giúp</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
                <li><a href="#">Điều khoản sử dụng</a></li>
                <li><a href="#">Chính sách hoàn tiền</a></li>
                <li><a href="#">Liên hệ hỗ trợ</a></li>
              </ul>
            </div>

            <div>
              <h4 class="footer-title">Liên hệ</h4>
              <ul class="footer-links">
                <li>📧 support@edupress.vn</li>
                <li>📞 1900-xxxx</li>
                <li>🏢 123 Đường ABC, Quận 1, TP.HCM</li>
                <li><a href="#">Fanpage Facebook</a></li>
                <li><a href="#">Kênh YouTube</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2026 Edupress. Tất cả quyền được bảo lưu. | Dự án demo cho mục đích học tập.</p>
          </div>
        </div>
      </footer>
    `;
  },

  initMobileMenu() {
    const menuBtn = Utils.getElement('#mobile-menu-btn');
    const nav = Utils.getElement('#main-nav');

    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => {
        const isOpen = Utils.hasClass(nav, 'show');
        Utils.toggleClass(nav, 'show');
        menuBtn.setAttribute('aria-expanded', !isOpen);
        menuBtn.innerHTML = isOpen
          ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>'
          : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      });

      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          Utils.removeClass(nav, 'show');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        });
      });
    }
  },

  initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'btn btn-primary scroll-to-top';
    scrollBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>';
    scrollBtn.setAttribute('aria-label', 'Cuộn lên đầu trang');
    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--transition-normal), visibility var(--transition-normal);
      z-index: 99;
    `;
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 100));

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

Utils.onReady(() => {
  App.init();
});

window.App = App;