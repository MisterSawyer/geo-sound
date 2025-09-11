// Config placeholders (injected by Jinja from index.html)
const BASE_AUDIO_URL = window.BASE_AUDIO_URL;
const BASE_API_DELETE_URL = window.BASE_API_DELETE_URL;
const TRACKS = window.TRACKS || [];

async function deleteTrack(name) {
  if (!confirm(`Are you sure you want to delete '${name}'?`)) {
    return;
  }

  const url = BASE_API_DELETE_URL.replace("__NAME__", encodeURIComponent(name));

  try {
    const response = await fetch(url, { method: "DELETE" });
    const data = await response.json();

    if (response.ok) {
        window.location.reload();
    } else {
      alert(data.error || "Failed to delete track");
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Error deleting track");
  }
}

async function addTrack(formElement) {
  const formData = new FormData(formElement);

  try {
    const response = await fetch(BASE_API_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
        window.location.reload();
        alert("Track uploaded successfully!");
    } else {
      alert(data.error || "Failed to upload track");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Error uploading track");
  }
}


document.querySelectorAll(".track").forEach(trackEl => {
  trackEl.addEventListener("click", () => {
    const lat = parseFloat(trackEl.dataset.lat);
    const lon = parseFloat(trackEl.dataset.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      const filename = trackEl.id.replace("track-", "");
      const marker = window.MARKERS[filename];

      if (marker) {
        window.MAP.setView(marker.getLatLng(), 50, { animate: true });  // zoom in
        marker.openPopup();
      } else {
        window.MAP.setView([lat, lon], 50, { animate: true });
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const leftPanel = document.querySelector(".left-panel");

  burger.addEventListener("click", () => {
    leftPanel.classList.toggle("collapsed");

    // Wait until CSS transition finishes, then tell Leaflet to resize
    setTimeout(() => {
      if (window.MAP) {
        window.MAP.invalidateSize();
      }
    }, 310); // a little longer than CSS transition (0.3s)
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-btn");
  const formPanel = document.getElementById("add-form-panel");

  addBtn.addEventListener("click", () => {
    formPanel.classList.toggle("active");
  });

  // Intercept form submit
  formPanel.querySelector("form.upload").addEventListener("submit", e => {
    e.preventDefault();
    addTrack(e.target);

    // hide form after upload
    formPanel.classList.remove("active");
  });
});