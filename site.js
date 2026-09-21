(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reading-progress span');
  let progressPending = false;

  function updateProgress() {
    if (!progress) return;
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const value = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    progress.style.transform = `scaleX(${value})`;
    progressPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!progressPending) {
      progressPending = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', updateProgress);
  updateProgress();

  document.querySelectorAll('a[href^="#"]:not(.skip-link):not([data-apply]):not([data-stories])').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!link.hash || link.hash === '#') return;

      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;

      event.preventDefault();
      const header = document.querySelector('.site-header');
      const offset = (header ? header.offsetHeight : 0) + 16;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      window.history.pushState(null, '', link.hash);
    });
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('can-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
  }

  const sectionLinks = [...document.querySelectorAll('.site-header nav a')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    ['fit', 'method', 'proof', 'pricing', 'about'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  function openDialog(dialog) {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    dialog.showModal();
    return true;
  }

  const application = document.getElementById('application-dialog');
  if (application) {
    const applicationFrame = application.querySelector('iframe');
    const applicationTitle = document.getElementById('application-title');
    const applicationAlternative = application.querySelector('.dialog-alternative a');
    const applicationForms = {
      standard: {
        heading: 'Apply to work with me.',
        title: 'Application for Guided Self-Mentorship or the Path to Living Well',
        embed: applicationFrame.dataset.src,
        url: 'https://tally.so/r/VL7Qbv'
      },
      guided: {
        heading: 'Apply for Guided Self-Mentorship.',
        title: 'Application for Guided Self-Mentorship',
        embed: applicationFrame.dataset.src,
        url: 'https://tally.so/r/VL7Qbv'
      },
      path: {
        heading: 'Apply for the Path.',
        title: 'Application for the Path to Living Well',
        embed: applicationFrame.dataset.src,
        url: 'https://tally.so/r/VL7Qbv'
      },
      supported: {
        heading: 'Apply for the Supported Path.',
        title: 'Application for a reduced-cost or no-cost Supported Path place',
        embed: 'https://tally.so/embed/LZx7kG?alignLeft=1&hideTitle=1&dynamicHeight=1',
        url: 'https://tally.so/r/LZx7kG'
      }
    };

    document.querySelectorAll('[data-apply]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!openDialog(application)) return;
        event.preventDefault();
        const text = link.textContent.toLowerCase();
        const inferred = text.includes('supported') ? 'supported' : text.includes('guided') ? 'guided' : text.includes('path') ? 'path' : 'standard';
        const form = applicationForms[link.dataset.apply || inferred] || applicationForms.standard;
        applicationTitle.textContent = form.heading;
        applicationAlternative.href = form.url;
        applicationFrame.title = form.title;
        if (applicationFrame.getAttribute('src') !== form.embed) {
          application.querySelector('.form-loading').hidden = false;
          applicationFrame.src = form.embed;
        }
      });
    });

    applicationFrame.addEventListener('load', () => {
      application.querySelector('.form-loading').hidden = true;
    });
  }

  const storiesDialog = document.getElementById('stories-dialog');
  const stories = window.adamStories || [];
  let storyIndex = 0;

  function showStory(index) {
    if (!storiesDialog || !stories.length) return;
    storyIndex = (index + stories.length) % stories.length;
    const story = stories[storyIndex];
    document.getElementById('story-title').textContent = `${story.name}${story.age ? `, ${story.age}` : ''}`;
    document.getElementById('story-excerpt').textContent = `“${story.excerpt}”`;
    const body = document.getElementById('story-body');
    body.replaceChildren(...story.body.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    document.getElementById('story-count').textContent = `${storyIndex + 1} / ${stories.length}`;
    storiesDialog.querySelector('.story-content').scrollTop = 0;
  }

  document.querySelectorAll('[data-stories]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!stories.length || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      showStory(0);
      if (openDialog(storiesDialog)) event.preventDefault();
    });
  });

  const previous = document.getElementById('story-previous');
  const next = document.getElementById('story-next');
  if (previous) previous.addEventListener('click', () => showStory(storyIndex - 1));
  if (next) next.addEventListener('click', () => showStory(storyIndex + 1));
  if (storiesDialog) {
    storiesDialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showStory(storyIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showStory(storyIndex + 1); }
    });
  }

  document.querySelectorAll('dialog').forEach((dialog) => {
    const close = dialog.querySelector('[data-close]');
    if (close) close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
})();
