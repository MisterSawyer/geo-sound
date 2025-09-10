document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var tracks = window.TRACKS || [];
    var bounds = L.latLngBounds([]);

    tracks.forEach(t => {
        if (t.metadata.lat && t.metadata.lon) {
            let audioUrl = BASE_AUDIO_URL + t.file;

            let popupContent = `
                <b>${t.metadata.title || t.file}</b><br/>
                ${t.metadata.owner || ''}<br/>
                <audio controls style="width:200px;">
                    <source src="${audioUrl}" type="audio/mpeg">
                </audio>
            `;
            let marker = L.marker([t.metadata.lat, t.metadata.lon])
                          .addTo(map)
                          .bindPopup(popupContent);

            bounds.extend(marker.getLatLng());
        }
    });

    if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
    }
});
