const Storage = {
  KEYS: {
    COURSES: 'edupress_courses',
    SPONSORS: 'edupress_sponsors',
    PROMOTIONS: 'edupress_promotions',
    USERS: 'edupress_users',
    CURRENT_USER: 'edupress_current_user',
    ENROLLMENTS: 'edupress_enrollments',
    FAVORITES: 'edupress_favorites',
    LEARNING_PROGRESS: 'edupress_learning_progress',
    SPONSOR_REQUESTS: 'edupress_sponsor_requests',
    SETTINGS: 'edupress_settings'
  },

  init() {
    this.loadInitialData();
  },

  loadInitialData() {
    if (!localStorage.getItem(this.KEYS.COURSES)) {
      this.loadJSON('data/courses.json').then(data => {
        this.set(this.KEYS.COURSES, data);
      }).catch(() => {
        console.warn('Không thể tải courses.json, sử dụng dữ liệu mặc định');
      });
    }

    if (!localStorage.getItem(this.KEYS.SPONSORS)) {
      this.loadJSON('data/sponsors.json').then(data => {
        this.set(this.KEYS.SPONSORS, data);
      }).catch(() => {
        console.warn('Không thể tải sponsors.json');
      });
    }

    if (!localStorage.getItem(this.KEYS.PROMOTIONS)) {
      this.loadJSON('data/promotions.json').then(data => {
        this.set(this.KEYS.PROMOTIONS, data);
      }).catch(() => {
        console.warn('Không thể tải promotions.json');
      });
    }

    if (!localStorage.getItem(this.KEYS.USERS)) {
      const defaultUsers = [
        {
          id: 'user_demo',
          name: 'Học viên Demo',
          email: 'demo@edupress.vn',
          password: '123456',
          avatar: '👨‍🎓',
          role: 'student',
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin_demo',
          name: 'Quản trị viên',
          email: 'admin@edupress.vn',
          password: 'admin123',
          avatar: '👑',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      this.set(this.KEYS.USERS, defaultUsers);
    }

    if (!localStorage.getItem(this.KEYS.ENROLLMENTS)) {
      this.set(this.KEYS.ENROLLMENTS, []);
    }

    if (!localStorage.getItem(this.KEYS.FAVORITES)) {
      this.set(this.KEYS.FAVORITES, []);
    }

    if (!localStorage.getItem(this.KEYS.LEARNING_PROGRESS)) {
      this.set(this.KEYS.LEARNING_PROGRESS, {});
    }

    if (!localStorage.getItem(this.KEYS.SPONSOR_REQUESTS)) {
      this.set(this.KEYS.SPONSOR_REQUESTS, []);
    }
  },

  async loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Lỗi đọc ${key}:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Lỗi ghi ${key}:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Lỗi xóa ${key}:`, e);
      return false;
    }
  },

  clear() {
    try {
      Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error('Lỗi xóa tất cả:', e);
      return false;
    }
  },

  resetDemoData() {
    this.clear();
    this.init();
    window.location.reload();
  },

  getCourses() {
    return this.get(this.KEYS.COURSES, []);
  },

  getCourseById(id) {
    const courses = this.getCourses();
    return courses.find(c => c.id === id) || null;
  },

  getSponsors() {
    return this.get(this.KEYS.SPONSORS, []);
  },

  getSponsorById(id) {
    const sponsors = this.getSponsors();
    return sponsors.find(s => s.id === id) || null;
  },

  getPromotions() {
    return this.get(this.KEYS.PROMOTIONS, []);
  },

  getPromotionById(id) {
    const promotions = this.getPromotions();
    return promotions.find(p => p.id === id) || null;
  },

  getPromotionByCode(code) {
    const promotions = this.getPromotions();
    return promotions.find(p => p.code === code) || null;
  },

  getActivePromotionsForCourse(courseId) {
    const promotions = this.getPromotions();
    const now = new Date();

    return promotions.filter(p => {
      if (!p.active) return false;
      if (new Date(p.startDate) > now) return false;
      if (new Date(p.endDate) < now) return false;
      if (p.courseIds && p.courseIds.length > 0 && !p.courseIds.includes(courseId)) return false;
      return true;
    });
  },

  getUsers() {
    return this.get(this.KEYS.USERS, []);
  },

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Utils.generateId('user_'),
      ...userData,
      role: 'student',
      avatar: userData.avatar || '👤',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.set(this.KEYS.USERS, users);
    return newUser;
  },

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    this.set(this.KEYS.USERS, users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser(users[index]);
    }

    return users[index];
  },

  getCurrentUser() {
    return this.get(this.KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user) {
    this.set(this.KEYS.CURRENT_USER, user);
  },

  clearCurrentUser() {
    this.remove(this.KEYS.CURRENT_USER);
  },

  login(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) return { success: false, message: 'Email không tồn tại' };
    if (user.password !== password) return { success: false, message: 'Mật khẩu không đúng' };

    this.setCurrentUser(user);
    return { success: true, user };
  },

  register(userData) {
    if (this.getUserByEmail(userData.email)) {
      return { success: false, message: 'Email đã được đăng ký' };
    }

    const user = this.createUser(userData);
    this.setCurrentUser(user);
    return { success: true, user };
  },

  logout() {
    this.clearCurrentUser();
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  getEnrollments(userId = null) {
    const enrollments = this.get(this.KEYS.ENROLLMENTS, []);
    if (!userId) return enrollments;
    return enrollments.filter(e => e.userId === userId);
  },

  getEnrollment(userId, courseId) {
    const enrollments = this.getEnrollments(userId);
    return enrollments.find(e => e.courseId === courseId) || null;
  },

  enrollUser(userId, courseId, paymentInfo = {}) {
    const enrollments = this.getEnrollments();
    const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);

    if (existing) {
      return { success: false, message: 'Đã đăng ký khóa học này', enrollment: existing };
    }

    const enrollment = {
      id: Utils.generateId('enroll_'),
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      lastAccessedLesson: null,
      status: 'active',
      payment: paymentInfo
    };

    enrollments.push(enrollment);
    this.set(this.KEYS.ENROLLMENTS, enrollments);

    const progressKey = `${userId}_${courseId}`;
    const progress = this.get(this.KEYS.LEARNING_PROGRESS, {});
    progress[progressKey] = {
      completedLessons: [],
      lastAccessedLesson: null,
      progress: 0
    };
    this.set(this.KEYS.LEARNING_PROGRESS, progress);

    return { success: true, enrollment };
  },

  updateEnrollmentProgress(userId, courseId, lessonId, completed) {
    const enrollments = this.getEnrollments();
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (!enrollment) return false;

    const course = this.getCourseById(courseId);
    if (!course) return false;

    const progressKey = `${userId}_${courseId}`;
    const allProgress = this.get(this.KEYS.LEARNING_PROGRESS, {});
    const progress = allProgress[progressKey] || { completedLessons: [], lastAccessedLesson: null, progress: 0 };

    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    } else if (!completed) {
      progress.completedLessons = progress.completedLessons.filter(id => id !== lessonId);
    }

    progress.lastAccessedLesson = lessonId;
    progress.progress = course.lessons.length > 0
      ? Math.round((progress.completedLessons.length / course.lessons.length) * 100)
      : 0;

    enrollment.progress = progress.progress;
    enrollment.completedLessons = [...progress.completedLessons];
    enrollment.lastAccessedLesson = lessonId;

    allProgress[progressKey] = progress;
    this.set(this.KEYS.LEARNING_PROGRESS, allProgress);
    this.set(this.KEYS.ENROLLMENTS, enrollments);

    return true;
  },

  getLearningProgress(userId, courseId) {
    const progressKey = `${userId}_${courseId}`;
    const allProgress = this.get(this.KEYS.LEARNING_PROGRESS, {});
    return allProgress[progressKey] || { completedLessons: [], lastAccessedLesson: null, progress: 0 };
  },

  getFavorites(userId = null) {
    const favorites = this.get(this.KEYS.FAVORITES, []);
    if (!userId) return favorites;
    return favorites.filter(f => f.userId === userId);
  },

  isFavorite(userId, courseId) {
    const favorites = this.getFavorites(userId);
    return favorites.some(f => f.courseId === courseId);
  },

  toggleFavorite(userId, courseId) {
    const favorites = this.getFavorites();

    const index = favorites.findIndex(f => f.userId === userId && f.courseId === courseId);

    if (index !== -1) {
      favorites.splice(index, 1);
      this.set(this.KEYS.FAVORITES, favorites);
      return { success: true, isFavorite: false };
    } else {
      favorites.push({
        id: Utils.generateId('fav_'),
        userId,
        courseId,
        createdAt: new Date().toISOString()
      });
      this.set(this.KEYS.FAVORITES, favorites);
      return { success: true, isFavorite: true };
    }
  },

  addSponsorRequest(requestData) {
    const requests = this.get(this.KEYS.SPONSOR_REQUESTS, []);
    const request = {
      id: Utils.generateId('req_'),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.push(request);
    this.set(this.KEYS.SPONSOR_REQUESTS, requests);
    return request;
  },

  getSponsorRequests() {
    return this.get(this.KEYS.SPONSOR_REQUESTS, []);
  },

  updateSponsorRequest(id, updates) {
    const requests = this.getSponsorRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return null;

    requests[index] = { ...requests[index], ...updates };
    this.set(this.KEYS.SPONSOR_REQUESTS, requests);
    return requests[index];
  },

  addCourse(courseData) {
    const courses = this.getCourses();
    const newCourse = {
      id: Utils.generateId('c'),
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    courses.push(newCourse);
    this.set(this.KEYS.COURSES, courses);
    return newCourse;
  },

  updateCourse(id, updates) {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    courses[index] = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
    this.set(this.KEYS.COURSES, courses);
    return courses[index];
  },

  deleteCourse(id) {
    const courses = this.getCourses();
    const filtered = courses.filter(c => c.id !== id);
    this.set(this.KEYS.COURSES, filtered);
    return true;
  },

  addPromotion(promoData) {
    const promotions = this.getPromotions();
    const newPromo = {
      id: Utils.generateId('pr'),
      ...promoData,
      createdAt: new Date().toISOString()
    };
    promotions.push(newPromo);
    this.set(this.KEYS.PROMOTIONS, promotions);
    return newPromo;
  },

  updatePromotion(id, updates) {
    const promotions = this.getPromotions();
    const index = promotions.findIndex(p => p.id === id);
    if (index === -1) return null;

    promotions[index] = { ...promotions[index], ...updates };
    this.set(this.KEYS.PROMOTIONS, promotions);
    return promotions[index];
  },

  deletePromotion(id) {
    const promotions = this.getPromotions();
    const filtered = promotions.filter(p => p.id !== id);
    this.set(this.KEYS.PROMOTIONS, filtered);
    return true;
  },

  addSponsor(sponsorData) {
    const sponsors = this.getSponsors();
    const newSponsor = {
      id: Utils.generateId('sp'),
      ...sponsorData,
      createdAt: new Date().toISOString()
    };
    sponsors.push(newSponsor);
    this.set(this.KEYS.SPONSORS, sponsors);
    return newSponsor;
  },

  updateSponsor(id, updates) {
    const sponsors = this.getSponsors();
    const index = sponsors.findIndex(s => s.id === id);
    if (index === -1) return null;

    sponsors[index] = { ...sponsors[index], ...updates };
    this.set(this.KEYS.SPONSORS, sponsors);
    return sponsors[index];
  },

  deleteSponsor(id) {
    const sponsors = this.getSponsors();
    const filtered = sponsors.filter(s => s.id !== id);
    this.set(this.KEYS.SPONSORS, filtered);
    return true;
  }
};

window.Storage = Storage;