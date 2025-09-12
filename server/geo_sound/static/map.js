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

      let audioUrl = window.BASE_AUDIO_URL + t.file;

      const ext = t.file.split(".").pop().toLowerCase();
      let mime = `audio/${ext}`;

      let popupContent = `
                <b>${t.metadata.title || t.file}</b><br/>
                ${t.metadata.owner || ""}<br/>
                <audio class="plyr" controls>
                    <source src="${audioUrl}" type="${mime}">
                </audio>
            `;
      let marker = L.marker([t.metadata.lat, t.metadata.lon], { icon })
        .addTo(window.MAP)
        .bindPopup(popupContent);

      // Initialize Plyr when popup opens
      marker.on("popupopen", (e) => {
        const popupEl = e.popup.getElement().querySelector("audio.plyr");
        if (popupEl) {
          const player = new Plyr(popupEl, {
            controls: ["play", "progress", "current-time", "duration"],
            autoplay: false,
          });

          // After initializing Plyr, restructure its controls
          const ctrls = popupEl
            .closest(".plyr")
            .querySelector(".plyr__controls");
          if (ctrls && !ctrls.querySelector(".plyr-buttons-row")) {
            const others = ctrls.querySelectorAll(
              ":scope > .plyr__controls__item:not(.plyr__progress__container)"
            );

            const row = document.createElement("div");
            row.classList.add("plyr-buttons-row");
            row.style.display = "flex";
            row.style.justifyContent = "center";
            row.style.alignItems = "center";
            row.style.gap = "0.5rem";
            row.style.marginTop = "0.3rem";

            others.forEach((el) => row.appendChild(el));
            ctrls.appendChild(row);
          }
        }
      });

      marker.on("popupclose", (e) => {
        const popupEl = e.popup.getElement().querySelector("audio.plyr");
        if (popupEl && popupEl.plyr) {
          popupEl.plyr.destroy();
        }
      });

      window.BOUNDS.extend(marker.getLatLng());

      // store marker by file (unique key)
      window.MARKERS[t.file] = marker;
    }
  });

  if (window.BOUNDS.isValid()) {
    window.MAP.fitBounds(window.BOUNDS.pad(0.2));
  }
});

// Helper to update marker position and show it
function showAddTrackMarker(lat, lon) 
{
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

    if(localStorage.getItem("auth_token") === null)return;

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

  map.on("move", updateMask);   // fires continuously during panning
  map.on("zoom", updateMask);   // fires during zoom animation

  return mask;
}