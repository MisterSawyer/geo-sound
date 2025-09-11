document.addEventListener("DOMContentLoaded", function () {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
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
                <audio controls style="width:200px;">
                    <source src="${audioUrl}" type="${mime}">
                </audio>
            `;
      let marker = L.marker([t.metadata.lat, t.metadata.lon], { icon })
        .addTo(window.MAP)
        .bindPopup(popupContent);

      window.BOUNDS.extend(marker.getLatLng());

      // store marker by file (unique key)
      window.MARKERS[t.file] = marker;
    }
  });

  if (window.BOUNDS.isValid()) {
    window.MAP.fitBounds(window.BOUNDS.pad(0.2));
  }
});
