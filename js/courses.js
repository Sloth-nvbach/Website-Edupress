const Courses = {
  currentPage: 1,
  itemsPerPage: 8,
  filters: {
    search: '',
    category: '',
    level: '',
    priceType: '',
    promotion: '',
    sort: 'default'
  },

  init(filters = {}) {
    this.filters = { ...this.filters, ...filters };
    this.currentPage = 1;
    this.bindEvents();
    this.loadCategories();
    this.render();
  },

  bindEvents() {
    const searchInput = Utils.getElement('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.filters.search = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.render();
      }, 300));
    }

    const categoryFilter = Utils.getElement('#category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const levelFilter = Utils.getElement('#level-filter');
    if (levelFilter) {
      levelFilter.addEventListener('change', (e) => {
        this.filters.level = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const priceFilter = Utils.getElement('#price-filter');
    if (priceFilter) {
      priceFilter.addEventListener('change', (e) => {
        this.filters.priceType = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const promotionFilter = Utils.getElement('#promotion-filter');
    if (promotionFilter) {
      promotionFilter.addEventListener('change', (e) => {
        this.filters.promotion = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const sortFilter = Utils.getElement('#sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.render();
      });
    }

    const clearFiltersBtn = Utils.getElement('#clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    const prevBtn = Utils.getElement('#prev-page');
    const nextBtn = Utils.getElement('#next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));
  },

  loadCategories() {
    const courses = Storage.getCourses();
    const categories = [...new Set(courses.map(c => c.category).filter(Boolean))].sort();
    const levels = [...new Set(courses.map(c => c.level).filter(Boolean))].sort();

    const categoryFilter = Utils.getElement('#category-filter');
    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
        categories.map(cat => `<option value="${Utils.escapeHtml(cat)}">${Utils.escapeHtml(cat)}</option>`).join('');
    }

    const levelFilter = Utils.getElement('#level-filter');
    if (levelFilter) {
      levelFilter.innerHTML = '<option value="">Tất cả cấp độ</option>' +
        levels.map(level => `<option value="${Utils.escapeHtml(level)}">${Utils.escapeHtml(level)}</option>`).join('');
    }
  },

  clearFilters() {
    this.filters = {
      search: '',
      category: '',
      level: '',
      priceType: '',
      promotion: '',
      sort: 'default'
    };
    this.currentPage = 1;

    const searchInput = Utils.getElement('#search-input');
    const categoryFilter = Utils.getElement('#category-filter');
    const levelFilter = Utils.getElement('#level-filter');
    const priceFilter = Utils.getElement('#price-filter');
    const promotionFilter = Utils.getElement('#promotion-filter');
    const sortFilter = Utils.getElement('#sort-filter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (levelFilter) levelFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (promotionFilter) promotionFilter.value = '';
    if (sortFilter) sortFilter.value = 'default';

    this.render();
  },

  getFilteredCourses() {
    let courses = Storage.getCourses();

    if (this.filters.search) {
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(this.filters.search) ||
        c.description.toLowerCase().includes(this.filters.search) ||
        c.category.toLowerCase().includes(this.filters.search)
      );
    }

    if (this.filters.category) {
      courses = courses.filter(c => c.category === this.filters.category);
    }

    if (this.filters.level) {
      courses = courses.filter(c => c.level === this.filters.level);
    }

    if (this.filters.priceType === 'free') {
      courses = courses.filter(c => c.isFree);
    } else if (this.filters.priceType === 'paid') {
      courses = courses.filter(c => !c.isFree);
    }

    if (this.filters.promotion === 'on-sale') {
      courses = courses.filter(c => {
        const promotions = Storage.getActivePromotionsForCourse(c.id);
        return promotions.length > 0;
      });
    }

    switch (this.filters.sort) {
      case 'name-asc':
        courses.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'name-desc':
        courses.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        break;
      case 'price-asc':
        courses.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        courses.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        courses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        courses.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return courses;
  },

  getPaginatedCourses() {
    const filtered = this.getFilteredCourses();
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return {
      courses: filtered.slice(start, end),
      totalPages,
      totalItems: filtered.length,
      currentPage: this.currentPage
    };
  },

  changePage(delta) {
    const { totalPages } = this.getPaginatedCourses();
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  render() {
    const container = Utils.getElement('#courses-grid');
    const pagination = Utils.getElement('#pagination');
    const resultsInfo = Utils.getElement('#results-info');

    if (!container) return;

    const { courses, totalPages, totalItems } = this.getPaginatedCourses();

    if (resultsInfo) {
      if (totalItems === 0) {
        resultsInfo.textContent = 'Không tìm thấy khóa học phù hợp';
      } else {
        resultsInfo.textContent = `Tìm thấy ${totalItems} khóa học${totalPages > 1 ? ` (trang ${this.currentPage}/${totalPages})` : ''}`;
      }
    }

    if (courses.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📚</div>
          <h3 class="empty-state-title">Không có khóa học nào</h3>
          <p class="empty-state-desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button class="btn btn-primary" id="clear-filters-btn">Xóa bộ lọc</button>
        </div>
      `;
      const clearBtn = Utils.getElement('#clear-filters-btn');
      if (clearBtn) clearBtn.addEventListener('click', () => this.clearFilters());
    } else {
      container.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    }

    if (pagination) {
      if (totalPages <= 1) {
        pagination.innerHTML = '';
      } else {
        let pagesHtml = '';
        if (this.currentPage > 1) {
          pagesHtml += `<button class="page-btn" id="prev-page" aria-label="Trang trước">‹</button>`;
        }

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
          pagesHtml += `<button class="page-btn" data-page="1">1</button>`;
          if (startPage > 2) pagesHtml += `<span class="page-btn" style="cursor: default; border-color: transparent;">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
          pagesHtml += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
          if (endPage < totalPages - 1) pagesHtml += `<span class="page-btn" style="cursor: default; border-color: transparent;">...</span>`;
          pagesHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        if (this.currentPage < totalPages) {
          pagesHtml += `<button class="page-btn" id="next-page" aria-label="Trang sau">›</button>`;
        }

        pagination.innerHTML = pagesHtml;

        pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.currentPage = parseInt(btn.dataset.page);
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });

        const prevBtn = Utils.getElement('#prev-page');
        const nextBtn = Utils.getElement('#next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));
      }
    }
  },

  createCourseCard(course) {
    const sponsor = Storage.getSponsorById(course.sponsorId);
    const promotions = Storage.getActivePromotionsForCourse(course.id);
    const hasPromotion = promotions.length > 0;
    const displayPrice = hasPromotion ? promotions[0].value : course.price;
    const discountPercent = hasPromotion && promotions[0].type === 'percent' ? promotions[0].value : null;

    let priceHtml = '';
    if (course.isFree) {
      priceHtml = '<span class="price-free">Miễn phí</span>';
    } else if (hasPromotion) {
      priceHtml = `
        <span class="price-current">${Utils.formatCurrency(displayPrice)}</span>
        <span class="price-original">${Utils.formatCurrency(course.price)}</span>
      `;
    } else {
      priceHtml = `<span class="price-current">${Utils.formatCurrency(course.price)}</span>`;
    }

    const badges = [];
    if (course.isFree) badges.push('<span class="badge badge-free">Miễn phí</span>');
    if (course.featured) badges.push('<span class="badge badge-new">Nổi bật</span>');
    if (hasPromotion) badges.push(`<span class="badge badge-sale">-${discountPercent || '30'}%</span>`);

    const imageSrc = course.thumbnail || 'assets/images/course-placeholder.png';

    return `
      <article class="card course-card" data-course-id="${course.id}">
        <div class="course-card-image">
          <img src="${Utils.escapeHtml(imageSrc)}" alt="${Utils.escapeHtml(course.title)}" loading="lazy" onerror="this.src='assets/images/course-placeholder.png'">
          ${badges.length > 0 ? `<div class="course-card-badges">${badges.join('')}</div>` : ''}
        </div>
        <div class="course-card-content">
          ${sponsor ? `<span class="course-card-category">${Utils.escapeHtml(sponsor.name)}</span>` : ''}
          <h3 class="course-card-title">${Utils.escapeHtml(course.title)}</h3>
          <div class="course-card-meta">
            <span>👨‍🏫 ${Utils.escapeHtml(course.instructor || 'Giảng viên')}</span>
            <span>⏱️ ${Utils.escapeHtml(course.duration || 'N/A')}</span>
            <span>📚 ${course.lessons ? course.lessons.length : 0} bài</span>
          </div>
          <div class="course-card-footer">
            <div class="course-card-price">${priceHtml}</div>
            <a href="course-detail.html?id=${course.id}" class="btn btn-primary btn-sm">Xem chi tiết</a>
          </div>
        </div>
      </article>
    `;
  },

  renderCourseCards(courses, containerSelector) {
    const container = Utils.getElement(containerSelector);
    if (!container) return;

    container.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
  },

  getFeaturedCourses(limit = 4) {
    return Storage.getCourses()
      .filter(c => c.featured)
      .slice(0, limit);
  },

  getFreeCourses(limit = 4) {
    return Storage.getCourses()
      .filter(c => c.isFree)
      .slice(0, limit);
  },

  getOnSaleCourses(limit = 4) {
    return Storage.getCourses()
      .filter(c => {
        const promotions = Storage.getActivePromotionsForCourse(c.id);
        return promotions.length > 0;
      })
      .slice(0, limit);
  },

  getCourseDetail(courseId) {
    const course = Storage.getCourseById(courseId);
    if (!course) return null;

    const sponsor = Storage.getSponsorById(course.sponsorId);
    const promotions = Storage.getActivePromotionsForCourse(courseId);
    const currentPrice = promotions.length > 0
      ? Utils.applyPromotion(course.price, promotions[0])
      : course.price;
    const discountPercent = promotions.length > 0 && promotions[0].type === 'percent'
      ? promotions[0].value
      : Utils.calculateDiscount(course.originalPrice, currentPrice);

    return {
      ...course,
      sponsor,
      promotions,
      currentPrice,
      discountPercent,
      hasPromotion: promotions.length > 0
    };
  }
};

window.Courses = Courses;