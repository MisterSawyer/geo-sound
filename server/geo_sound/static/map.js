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

  tracks.forEach((t) => {
    if (t.metadata.lat && t.metadata.lon) {
      const pinColor = t.metadata.color || "#3388ff"; // fallback Leaflet blue

      // Custom Leaflet colored icon
      const icon = L.divIcon({
        className: "custom-pin",
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
                       <path d="M12 0C6 0 0 6 0 12c0 9 12 24 12 24s12-15 12-24c0-6-6-12-12-12z"
                             fill="${pinColor}" stroke="black" stroke-width="1"/>
                     </svg>`,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
      });

    const playIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="32" height="32">
        <path d="M6 4.5v9l7-4.5-7-4.5z" fill="currentColor"/>
      </svg>`;
    const pauseIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="32" height="32">
        <path d="M6 4h2v10H6zm4 0h2v10h-2z" fill="currentColor"/>
      </svg>`;

      const popupDiv = document.createElement("div");
      popupDiv.innerHTML = `
        <b>${t.metadata.title}</b><br/>
        ${t.metadata.owner || ""}<br/>
        <div class="popup-player" data-track="${t.metadata.title}">
            <button class="popup-toggle">▶</button>
            <input type="range" class="popup-progress" min="0" max="100" step="0.1" value="0">
            <span class="popup-time">0:00 / 0:00</span>
        </div>
        `;

      let marker = L.marker([t.metadata.lat, t.metadata.lon], { icon })
        .addTo(window.MAP)
        .bindPopup(popupDiv);

      marker.on("popupopen", (e) => {
        // Remove active from all tracks
        document
          .querySelectorAll(".track")
          .forEach((el) => el.classList.remove("active"));

        // Highlight the matching track
        const trackEl = document.getElementById(`track-${t.metadata.title}`);
        if (trackEl) {
          trackEl.classList.add("active");
          trackEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        const popupDiv = e.popup.getElement().querySelector(".popup-player");
        if (!popupDiv) return;

        const trackName = popupDiv.dataset.track;
        const player = window.PLAYERS[trackName]; // Plyr instance in All Tracks
        if (!player) return;

        const toggleBtn = popupDiv.querySelector(".popup-toggle");
        const slider = popupDiv.querySelector(".popup-progress");
        const timeLabel = popupDiv.querySelector(".popup-time");

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

        // --- Update on player events ---
        player.on("play", updateToggleIcon);
        player.on("pause", updateToggleIcon);

        player.on("timeupdate", () => {
          if (!player.duration) return;
          const percent = (player.currentTime / player.duration) * 100;
          slider.value = percent || 0;

          // Format mm:ss
          const fmt = (sec) => {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60)
              .toString()
              .padStart(2, "0");
            return `${m}:${s}`;
          };
          timeLabel.textContent = `${fmt(player.currentTime)} / ${fmt(
            player.duration
          )}`;
        });

        // --- Seek from popup slider ---
        slider.addEventListener("input", () => {
          if (player.duration) {
            const time = (slider.value / 100) * player.duration;
            player.currentTime = time;
          }
        });

        // Init button state
        updateToggleIcon();
      });

      marker.on("popupclose", (e) => {
        const trackEl = document.getElementById(`track-${t.metadata.title}`);
        if (trackEl) {
          trackEl.classList.remove("active");
        }
      });

      window.BOUNDS.extend(marker.getLatLng());

      // store marker
      window.MARKERS[t.metadata.title] = marker;
    }
  });

  if (window.BOUNDS.isValid()) {
    window.MAP.fitBounds(window.BOUNDS.pad(0.2));
  }
});

// Helper to update marker position and show it
function showAddTrackMarker(lat, lon) {
  addTrackMarker.setLatLng([lat, lon]);
  addTrackMarker.setStyle({ opacity: 1, fillOpacity: 0.8 });
}

// Helper to hide marker
function hideAddTrackMarker() {
  addTrackMarker.setStyle({ opacity: 0, fillOpacity: 0 });
}

// Expose helpers globally so tracks.js can use them
window.showAddTrackMarker = showAddTrackMarker;
window.hideAddTrackMarker = hideAddTrackMarker;

// Right-click handler on map
window.MAP.on("contextmenu", function (e) {
  if (localStorage.getItem("auth_token") === null) return;

  // e.latlng contains {lat, lng}
  const lat = e.latlng.lat.toFixed(6);
  const lon = e.latlng.lng.toFixed(6);

  // Open the add form panel
  const formPanel = document.getElementById("add-form-panel");
  formPanel.classList.add("active");

  // Fill coordinates into form inputs
  const latInput = formPanel.querySelector('input[name="lat"]');
  const lonInput = formPanel.querySelector('input[name="lon"]');

  if (latInput && lonInput) {
    latInput.value = lat;
    lonInput.value = lon;
  }

  showAddTrackMarker(lat, lon);
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
    pane: "overlayPane", // keep under popups/markers
  }).addTo(map);

  // --- Recompute mask hole during pan/zoom ---
  function updateMask() {
    console.log("updateMask");
    const inner = getInner();
    mask.setLatLngs([world, inner]);
  }

  map.on("move", updateMask); // fires continuously during panning
  map.on("zoom", updateMask); // fires during zoom animation

  return mask;
}
