(() => {
  const grid = document.getElementById('courseVideoGrid');
  if (!grid) return;

  const MANIFEST = './videos.json';
  const RAW = 'https://media.githubusercontent.com/media/LaxmanNepal/Videos/main/course/youtube/';
  const DONE_KEY = 'laxman-youtube-course-done-v1';

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));

  const naturalCompare = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  const getDone = () => {
    try {
      const value = JSON.parse(localStorage.getItem(DONE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };

  const lessonNumber = (index) => String(index + 1).padStart(2, '0');

  const render = videos => {
    const done = getDone();
    const count = document.getElementById('videoCount');
    if (count) count.textContent = `${videos.length} videos`;

    if (!videos.length) {
      grid.innerHTML = '<div class="empty-dashboard">No course videos were found in the manifest.</div>';
      return;
    }

    grid.innerHTML = videos.map((video, index) => {
      const completed = done.includes(index);
      const n = lessonNumber(index);
      const title = escapeHtml(video.title || video.name || `Lesson ${n}`);
      return `
        <a class="course-video-card${completed ? ' completed' : ''}" href="lesson.html?lesson=${index}" aria-label="Open lesson ${n}: ${title}">
          <div class="course-video-thumb">
            <div class="course-video-art">
              <span class="course-video-number">${n}</span>
              <span class="course-video-play">▶</span>
            </div>
            <span class="course-video-label">${completed ? '✓ COMPLETED' : `LESSON ${n}`}</span>
          </div>
          <div class="course-video-info">
            <h3>${title}</h3>
            <p>YouTube Creator Course · Lesson ${n}</p>
          </div>
          <span class="course-video-arrow">→</span>
        </a>`;
    }).join('');
  };

  const showError = () => {
    grid.innerHTML = `
      <div class="empty-dashboard course-video-error">
        <strong>Course index is still being generated.</strong>
        <span>Wait for the GitHub Pages deployment to finish, then refresh this page.</span>
      </div>`;
  };

  fetch(`${MANIFEST}?v=${Date.now()}`, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
      return response.json();
    })
    .then(files => {
      const videos = (Array.isArray(files) ? files : [])
        .filter(item => item && item.name && /\.mp4$/i.test(item.name))
        .sort((a, b) => naturalCompare(a.name, b.name))
        .map(item => ({
          name: item.name,
          title: item.title || item.name.replace(/\.mp4$/i, '').replace(/[_-]+/g, ' ').trim(),
          url: item.url || `${RAW}${encodeURIComponent(item.name)}`
        }));
      render(videos);
    })
    .catch(showError);

  window.addEventListener('storage', event => {
    if (event.key === DONE_KEY) {
      fetch(`${MANIFEST}?v=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(files => {
          const videos = (Array.isArray(files) ? files : [])
            .filter(item => item && item.name && /\.mp4$/i.test(item.name))
            .sort((a, b) => naturalCompare(a.name, b.name));
          render(videos);
        })
        .catch(() => {});
    }
  });
})();