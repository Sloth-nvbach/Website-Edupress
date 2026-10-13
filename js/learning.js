const Learning = {
  currentCourseId: null,
  currentLessonIndex: 0,
  course: null,
  enrollment: null,
  progress: null,

  init(courseId) {
    this.currentCourseId = courseId;
    this.course = Storage.getCourseById(courseId);
    this.enrollment = Auth.currentUser ? Storage.getEnrollment(Auth.currentUser.id, courseId) : null;
    this.progress = Auth.currentUser ? Storage.getLearningProgress(Auth.currentUser.id, courseId) : null;

    if (!this.course) {
      window.location.href = 'courses.html';
      return;
    }

    if (!this.enrollment && !this.course.isFree) {
      Utils.showToast('Bạn chưa đăng ký khóa học này', 'warning');
      setTimeout(() => window.location.href = `course-detail.html?id=${courseId}`, 2000);
      return;
    }

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const lessonItems = Utils.getElements('.lesson-item');
    lessonItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.lesson-checkbox')) return;
        this.selectLesson(index);
      });

      const checkbox = item.querySelector('.lesson-checkbox');
      if (checkbox) {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleLessonComplete(index);
        });
      }
    });

    const prevLessonBtn = Utils.getElement('#prev-lesson');
    const nextLessonBtn = Utils.getElement('#next-lesson');
    if (prevLessonBtn) prevLessonBtn.addEventListener('click', () => this.navigateLesson(-1));
    if (nextLessonBtn) nextLessonBtn.addEventListener('click', () => this.navigateLesson(1));

    const continueBtn = Utils.getElement('#continue-learning');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.progress.lastAccessedLesson !== null) {
          this.selectLesson(this.progress.lastAccessedLesson);
        } else if (this.course.lessons.length > 0) {
          this.selectLesson(0);
        }
      });
    }
  },

  render() {
    this.renderSidebar();
    this.selectLesson(this.getInitialLessonIndex());
  },

  getInitialLessonIndex() {
    if (this.progress.lastAccessedLesson !== null) {
      return this.progress.lastAccessedLesson;
    }
    const firstIncomplete = this.course.lessons.findIndex((_, i) =>
      !this.progress.completedLessons.includes(this.course.lessons[i].id)
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  },

  renderSidebar() {
    const container = Utils.getElement('#lesson-list');
    if (!container) return;

    container.innerHTML = this.course.lessons.map((lesson, index) => {
      const isCompleted = this.progress.completedLessons.includes(lesson.id);
      const isCurrent = index === this.currentLessonIndex;
      const lessonProgress = this.enrollment ? this.enrollment.completedLessons.includes(lesson.id) : isCompleted;

      return `
        <div class="lesson-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" data-lesson-index="${index}">
          <div class="lesson-checkbox ${lessonProgress ? 'checked' : ''}" data-lesson-id="${lesson.id}" aria-label="${lessonProgress ? 'Đã hoàn thành' : 'Chưa hoàn thành'}">
            ${lessonProgress ? '✓' : ''}
          </div>
          <div class="lesson-info">
            <div class="lesson-title">${Utils.escapeHtml(lesson.title)}</div>
            <div class="lesson-duration">${isCompleted ? '✓ Đã hoàn thành' : 'Chưa học'}</div>
          </div>
          <span class="lesson-action">${isCurrent ? 'Đang học' : 'Chọn'}</span>
        </div>
      `;
    }).join('');

    this.bindEvents();
    this.updateProgressBar();
  },

  selectLesson(index) {
    if (index < 0 || index >= this.course.lessons.length) return;

    this.currentLessonIndex = index;
    const lesson = this.course.lessons[index];

    const lessonItems = Utils.getElements('.lesson-item');
    lessonItems.forEach((item, i) => {
      Utils.toggleClass(item, 'current', i === index);
      const action = item.querySelector('.lesson-action');
      if (action) action.textContent = i === index ? 'Đang học' : 'Chọn';
    });

    this.renderLessonContent(lesson);

    const prevBtn = Utils.getElement('#prev-lesson');
    const nextBtn = Utils.getElement('#next-lesson');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === this.course.lessons.length - 1;

    this.saveLastAccessedLesson(index);
  },

  renderLessonContent(lesson) {
    const container = Utils.getElement('#lesson-content');
    if (!container) return;

    const isCompleted = this.progress.completedLessons.includes(lesson.id);
    const videoHtml = lesson.video ? `
      <div class="video-container">
        <iframe src="${Utils.escapeHtml(lesson.video)}" allowfullscreen></iframe>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="lesson-header">
        <h2 class="lesson-title">${Utils.escapeHtml(lesson.title)}</h2>
        <div class="lesson-progress">
          Bài ${this.currentLessonIndex + 1} / ${this.course.lessons.length}
        </div>
      </div>
      ${videoHtml}
      <div class="lesson-body">
        ${Utils.escapeHtml(lesson.content).replace(/\n/g, '<br>')}
      </div>
      <div class="lesson-actions">
        <button class="btn ${isCompleted ? 'btn-outline' : 'btn-primary'}" id="mark-complete-btn">
          ${isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
        </button>
      </div>
    `;

    const markCompleteBtn = Utils.getElement('#mark-complete-btn');
    if (markCompleteBtn) {
      markCompleteBtn.addEventListener('click', () => this.toggleLessonComplete(this.currentLessonIndex));
    }
  },

  toggleLessonComplete(index) {
    if (!Auth.currentUser) {
      Utils.showToast('Vui lòng đăng nhập để lưu tiến độ', 'warning');
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    const lesson = this.course.lessons[index];
    const isCompleted = this.progress.completedLessons.includes(lesson.id);

    Storage.updateEnrollmentProgress(Auth.currentUser.id, this.currentCourseId, lesson.id, !isCompleted);

    this.progress = Storage.getLearningProgress(Auth.currentUser.id, this.currentCourseId);
    this.enrollment = Storage.getEnrollment(Auth.currentUser.id, this.currentCourseId);

    const lessonItems = Utils.getElements('.lesson-item');
    const item = lessonItems[index];
    if (item) {
      Utils.toggleClass(item, 'completed', !isCompleted);
      const checkbox = item.querySelector('.lesson-checkbox');
      if (checkbox) Utils.toggleClass(checkbox, 'checked', !isCompleted);
      const duration = item.querySelector('.lesson-duration');
      if (duration) duration.textContent = !isCompleted ? '✓ Đã hoàn thành' : 'Chưa học';
    }

    const markCompleteBtn = Utils.getElement('#mark-complete-btn');
    if (markCompleteBtn) {
      markCompleteBtn.textContent = !isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành';
      Utils.toggleClass(markCompleteBtn, 'btn-primary', isCompleted);
      Utils.toggleClass(markCompleteBtn, 'btn-outline', !isCompleted);
    }

    this.updateProgressBar();
    Utils.showToast(!isCompleted ? 'Đã hoàn thành bài học!' : 'Đã bỏ tích hoàn thành', 'success');
  },

  navigateLesson(direction) {
    const newIndex = this.currentLessonIndex + direction;
    if (newIndex >= 0 && newIndex < this.course.lessons.length) {
      this.selectLesson(newIndex);
    }
  },

  saveLastAccessedLesson(index) {
    if (!Auth.currentUser) return;

    const progressKey = `${Auth.currentUser.id}_${this.currentCourseId}`;
    const allProgress = Storage.get(Storage.KEYS.LEARNING_PROGRESS, {});
    const progress = allProgress[progressKey] || { completedLessons: [], lastAccessedLesson: null, progress: 0 };

    progress.lastAccessedLesson = index;
    allProgress[progressKey] = progress;
    Storage.set(Storage.KEYS.LEARNING_PROGRESS, allProgress);
  },

  updateProgressBar() {
    const progressBar = Utils.getElement('#progress-fill');
    const progressText = Utils.getElement('#progress-percent');
    const progressHeader = Utils.getElement('.progress-text');

    if (progressBar && progressText) {
      const percent = this.progress.progress || 0;
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${percent}%`;
    }

    if (progressHeader) {
      const completed = this.progress.completedLessons.length;
      const total = this.course.lessons.length;
      progressHeader.textContent = `Tiến độ: ${completed}/${total} bài học`;
    }
  }
};

window.Learning = Learning;