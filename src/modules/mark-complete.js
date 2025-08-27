// Mark Complete module - handles lesson completion tracking
Attributes.register('mark-complete', function() {
  // Add CSS to hide buttons by default
  if (!document.getElementById('attributes-mark-complete-styles')) {
    const style = document.createElement('style');
    style.id = 'attributes-mark-complete-styles';
    style.textContent = `
      [data-o-lesson-action] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  Outseta.getUser().then(function(user) {
    const wrapper = document.querySelector('[data-o-lesson-id]');
    if (!wrapper) return;

    const lessonId = wrapper.getAttribute('data-o-lesson-id');
    const markBtn = wrapper.querySelector('[data-o-lesson-action="mark"]');
    const unmarkBtn = wrapper.querySelector('[data-o-lesson-action="unmark"]');

    const data = JSON.parse(user.CompletedLessons || '[]');

    const setComplete = () => {
      if (markBtn) markBtn.style.display = 'none';
      if (unmarkBtn) unmarkBtn.style.display = 'inline-flex';
    };

    const unsetComplete = () => {
      if (markBtn) markBtn.style.display = 'inline-flex';
      if (unmarkBtn) unmarkBtn.style.display = 'none';
    };

    // Initial state
    if (data.includes(lessonId)) {
      setComplete();
    } else {
      unsetComplete();
    }

    // Mark complete
    markBtn?.addEventListener('click', () => {
      if (!data.includes(lessonId)) {
        data.push(lessonId);
        user.update({ CompletedLessons: JSON.stringify(data) })
            .then(setComplete);
      }
    });

    // Unmark complete
    unmarkBtn?.addEventListener('click', () => {
      const idx = data.indexOf(lessonId);
      if (idx !== -1) {
        data.splice(idx, 1);
        user.update({ CompletedLessons: JSON.stringify(data) })
            .then(unsetComplete);
      }
    });
  });
});
