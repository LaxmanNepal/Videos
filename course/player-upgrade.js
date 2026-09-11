(() => {
  const player = document.getElementById('player');
  const back = document.getElementById('back10Btn');
  const forward = document.getElementById('forward10Btn');
  const hint = document.getElementById('skipHint');
  const speedBtn = document.getElementById('speedBtn');
  const speedMenu = document.getElementById('speedMenu');
  if (!player) return;

  const SPEED_KEY = 'laxman-youtube-player-speed-v1';
  const savedSpeed = Number(localStorage.getItem(SPEED_KEY));
  if ([0.75,1,1.25,1.5,1.75,2].includes(savedSpeed)) {
    player.playbackRate = savedSpeed;
    if (speedBtn) speedBtn.textContent = savedSpeed + '×';
  }

  const showSkip = (seconds) => {
    if (!hint) return;
    hint.textContent = seconds < 0 ? `↶ ${Math.abs(seconds)} seconds` : `↷ ${seconds} seconds`;
    hint.classList.remove('show');
    void hint.offsetWidth;
    hint.classList.add('show');
    clearTimeout(showSkip.timer);
    showSkip.timer = setTimeout(() => hint.classList.remove('show'), 650);
  };

  const jump = seconds => {
    const next = Math.max(0, Math.min(player.duration || Infinity, player.currentTime + seconds));
    player.currentTime = next;
    showSkip(seconds);
  };

  back?.addEventListener('click', () => jump(-10));
  forward?.addEventListener('click', () => jump(10));

  speedMenu?.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const speed = Number(button.dataset.speed);
      if (!Number.isFinite(speed)) return;
      player.playbackRate = speed;
      localStorage.setItem(SPEED_KEY, String(speed));
      if (speedBtn) speedBtn.textContent = speed + '×';
    });
  });

  player.addEventListener('dblclick', event => {
    const rect = player.getBoundingClientRect();
    jump(event.clientX - rect.left < rect.width / 2 ? -10 : 10);
  });
})();
