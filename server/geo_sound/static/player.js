document.addEventListener("DOMContentLoaded", () => {
  window.PLAYERS = {};
  document.querySelectorAll('.track audio.plyr').forEach(el => {
    const player = new Plyr(el, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
    });
    const name = el.closest('.track').id.replace("track-", "");
    window.PLAYERS[name] = player;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.plyr--audio .plyr__controls').forEach(ctrls => {
    const progress = ctrls.querySelector('.plyr__progress__container');
    const others = ctrls.querySelectorAll(':scope > .plyr__controls__item:not(.plyr__progress__container)');

    // Skip if we've already wrapped
    if (ctrls.querySelector('.plyr-buttons-row')) return;

    // Make a dedicated row for buttons
    const row = document.createElement('div');
    row.classList.add('plyr-buttons-row');
    row.style.display = 'flex';
    row.style.justifyContent = 'center';
    row.style.alignItems = 'center';
    row.style.gap = '0.5rem';
    row.style.marginTop = '0.3rem';

    others.forEach(el => row.appendChild(el));
    ctrls.appendChild(row);
  });
});
