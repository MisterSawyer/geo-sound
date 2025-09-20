function closeTracksList() {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");

  tracksListPanel.classList.remove("translate-x-0");
  tracksListPanel.classList.add("translate-x-full");
  burger.classList.remove("header-btn-pressed");

  setTimeout(() => {
    if (window.MAP) window.MAP.invalidateSize();
  }, 310);
}

function openTracksList() {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");
  document.dispatchEvent(new CustomEvent("panel:open", { detail: "tracks" }));
  tracksListPanel.classList.remove("translate-x-full");
  tracksListPanel.classList.add("translate-x-0");
  burger.classList.add("header-btn-pressed");

  setTimeout(() => {
    if (window.MAP) window.MAP.invalidateSize();
  }, 310);
}

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent("panel:open", { detail: "tracks" }));

    if (tracksListPanel.classList.contains("translate-x-full")) {
      openTracksList();
    } else {
      closeTracksList();
    }
  });

  document.addEventListener("panel:open", (e) => {
    if (e.detail !== "tracks") {
      closeTracksList();
    }
  });
});

window.openTracksList = openTracksList;
