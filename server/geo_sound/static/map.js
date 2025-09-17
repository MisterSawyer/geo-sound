// Create a reusable marker (hidden by default)
const addTrackMarker = L.circleMarker([0, 0], {
  radius: 6,
  color: "#666",
  fillColor: "#999",
  fillOpacity: 0.8,
}).addTo(window.MAP);

addTrackMarker.setStyle({ opacity: 0, fillOpacity: 0 }); // start hidden

document.addEventListener("DOMContentLoaded", function () {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 20,
    maxNativeZoom: 19,
  }).addTo(window.MAP);

  var tracks = window.TRACKS || [];
  window.BOUNDS = L.latLngBounds([]);

  const popupTemplate = document.getElementById("popup-template");

  tracks.forEach((t) => {
    if (t.metadata.lat && t.metadata.lon) {
      const pinColor = t.metadata.color || "#3388ff";

      const icon = L.divIcon({
        className: "",
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
                 <path d="M12 0C6 0 0 6 0 12c0 9 12 24 12 24s12-15 12-24c0-6-6-12-12-12z"
                       fill="${pinColor}" stroke="black" stroke-width="1"/>
               </svg>`,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
      });

      const trackId = t.metadata.title;

      let marker = L.marker([t.metadata.lat, t.metadata.lon], { icon })
        .addTo(window.MAP)
        .bindPopup(document.createElement("div")); // empty popup;

      // On popup open → clone template fresh, fill in, attach
      marker.on("popupopen", () => {
        // Remove "active" from all tracks
        document.querySelectorAll("[id^='track-']").forEach((el) =>
          el.classList.remove("active")
        );

        // Highlight the matching track in sidebar
        const trackEl = document.getElementById(`track-${trackId}`);
        if (trackEl) {
          trackEl.classList.add("active");
          trackEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // --- Clone template ---
        const fragment = popupTemplate.content.cloneNode(true);
        const popupDiv = document.createElement("div");
        popupDiv.appendChild(fragment);

        // Fill in dynamic values
        popupDiv.querySelector(".popup-title").textContent = t.metadata.title;
        popupDiv.querySelector(".popup-owner").textContent =
          t.metadata.owner || "";

        // Hook controls
        const toggleBtn = popupDiv.querySelector(".popup-toggle");
        const slider = popupDiv.querySelector(".popup-progress");
        const timeLabel = popupDiv.querySelector(".popup-time");

        const player = window.PLAYERS[trackId];
        if (!player) return;

        const playIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="32" height="32">
            <path d="M6 4.5v9l7-4.5-7-4.5z" fill="currentColor"/>
          </svg>`;
        const pauseIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="32" height="32">
            <path d="M6 4h2v10H6zm4 0h2v10h-2z" fill="currentColor"/>
          </svg>`;

        // --- Toggle play/pause ---
        const updateToggleIcon = () => {
          toggleBtn.innerHTML = player.playing ? pauseIcon : playIcon;
        };

        toggleBtn.onclick = () => {
          if (player.playing) {
            player.pause();
          } else {
            player.play();
          }
        };

        // --- Update UI on player events ---
        player.on("play", updateToggleIcon);
        player.on("pause", updateToggleIcon);

        player.on("timeupdate", () => {
          if (!player.duration) return;
          const percent = (player.currentTime / player.duration) * 100;
          slider.value = percent || 0;

          const fmt = (sec) => {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
          };
          timeLabel.textContent = `${fmt(player.currentTime)} / ${fmt(
            player.duration
          )}`;
        });

        // --- Seek from slider ---
        slider.addEventListener("input", () => {
          if (player.duration) {
            const time = (slider.value / 100) * player.duration;
            player.currentTime = time;
          }
        });

        updateToggleIcon();
//open the tracks list panel
  if (typeof window.openTracksList === "function") {

    window.openTracksList();
  }

        // Finally, inject into popup
        marker.setPopupContent(popupDiv);
      });

      marker.on("popupclose", () => {
        const trackEl = document.getElementById(`track-${trackId}`);
        if (trackEl) {
          trackEl.classList.remove("active");
        }
      });

      window.BOUNDS.extend(marker.getLatLng());
      window.MARKERS[trackId] = marker;
    }
  });

  if (window.BOUNDS.isValid()) {
    window.MAP.fitBounds(window.BOUNDS.pad(0.5));
  }
});

// Marker helpers
function showAddTrackMarker(lat, lon) {
  addTrackMarker.setLatLng([lat, lon]);
  addTrackMarker.setStyle({ opacity: 1, fillOpacity: 0.8 });
}

function hideAddTrackMarker() {
  addTrackMarker.setStyle({ opacity: 0, fillOpacity: 0 });
}

window.showAddTrackMarker = showAddTrackMarker;
window.hideAddTrackMarker = hideAddTrackMarker;

// Right-click handler for adding tracks
window.MAP.on("contextmenu", function (e) {
  if (localStorage.getItem("auth_token") === null) return;

  const lat = e.latlng.lat.toFixed(6);
  const lon = e.latlng.lng.toFixed(6);

  const latInput = document.getElementById("form-lat");
  const lonInput = document.getElementById("form-lon");

  if (latInput && lonInput) {
    latInput.value = lat;
    lonInput.value = lon;
  }

  showAddTrackMarker(lat, lon);

  if (window.openAddPanel) {
    openAddPanel();
  }
});

function addBoundsMask(map, maxBounds) {
  const world = [
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180],
  ];

  function getInner() {
    return [
      [maxBounds.getSouth(), maxBounds.getWest()],
      [maxBounds.getSouth(), maxBounds.getEast()],
      [maxBounds.getNorth(), maxBounds.getEast()],
      [maxBounds.getNorth(), maxBounds.getWest()],
    ];
  }

  const mask = L.polygon([world, getInner()], {
    color: "#000",
    fillColor: "#000",
    fillOpacity: 0.3,
    stroke: true,
    interactive: true,
    pane: "overlayPane",
  }).addTo(map);

  function updateMask() {
    const inner = getInner();
    mask.setLatLngs([world, inner]);
  }

  map.on("move", updateMask);
  map.on("zoom", updateMask);

  return mask;
}
