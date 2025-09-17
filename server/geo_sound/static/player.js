document.addEventListener("DOMContentLoaded", () => {
  window.PLAYERS = {};

  document.querySelectorAll("[id^='track-'] audio").forEach(el => {
    const player = new Plyr(el, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
    });
    const name = el.closest("[id^='track-']").id.replace("track-", "");
    window.PLAYERS[name] = player;




const playerRoot = player.elements.container; // Plyr's main container
const current = playerRoot.querySelector(".plyr__time--current");
const duration = playerRoot.querySelector(".plyr__time--duration");

    if (current && duration && !playerRoot.querySelector(".plyr-time-row")) {
  const timeRow = document.createElement("div");
  timeRow.classList.add("plyr-time-row");

  timeRow.appendChild(current);
  timeRow.appendChild(duration);

  playerRoot.querySelector(".plyr__controls").appendChild(timeRow);
}
  });

  // Select controls containers
  document.querySelectorAll("[id^='plyr-controls-']").forEach(ctrls => {
    const progress = ctrls.querySelector("[id^='plyr-progress-']");
    const others = Array.from(ctrls.children).filter(
      el => !el.id.startsWith("plyr-progress-")
    );

    // --- 1. Wrap buttons (your existing code) ---
    if (!ctrls.querySelector("[id^='plyr-buttons-row-']")) {
        console.log("wrap")
      const row = document.createElement("div");
      row.id = `plyr-buttons-row-${ctrls.dataset.track}`;
      row.classList.add("plyr-buttons-row");

      others.forEach(el => row.appendChild(el));
      ctrls.appendChild(row);
    }
  });
});