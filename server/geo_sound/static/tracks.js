function authHeaders(extra = {}) {
  const token = localStorage.getItem("auth_token");
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : extra;
}


const BASE_AUDIO_URL = window.BASE_AUDIO_URL;
const TRACKS = window.TRACKS || [];

async function deleteTrack(name) {
  if (!confirm(`Are you sure you want to delete '${name}'?`)) {
    return;
  }

  const url = window.BASE_API_DELETE_URL.replace("__NAME__", encodeURIComponent(name));

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(),   // send token
    });
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
    const response = await fetch(window.BASE_API_UPLOAD_URL, {
      method: "POST",
      headers: authHeaders(),   // send token
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

async function renameTrack(oldName, newName) {
  const url = window.BASE_API_RENAME_URL.replace(
    "__OLD__",
    encodeURIComponent(oldName)
  );

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ new_name: newName }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Renamed successfully:", data);
    } else {
      alert(data.error || "Failed to rename track");
    }
  } catch (err) {
    console.error("Rename request failed:", err);
    alert("Error renaming track");
  }
}

async function changeColor(name, color) {
  const url = window.BASE_API_COLOR_URL.replace(
    "__NAME__",
    encodeURIComponent(name)
  );

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ color }),
    });
    const data = await response.json();

    if (response.ok) {
      console.log("Color changed successfully:", data);
    } else {
      alert(data.error || "Failed to update color");
    }
  } catch (err) {
    console.error("Color update failed:", err);
    alert("Error updating color");
  }
}

// Keep references to active listeners per track
const editListeners = {};

function toggleEdit(trackName) {
  const trackEl = document.getElementById(`track-${trackName}`);
  const titleEl = document.getElementById(`title-${trackName}`);

  const actionsEl = trackEl.querySelector(".track-actions");

  if (!titleEl || !trackEl || !actionsEl) return;

  const originalColor = trackEl.dataset.color || "#3388ff";
  console.log(originalColor);
  // Already editing → cancel
  const input = titleEl.querySelector(".edit-input");
  if (input) {
    cancelEdit(trackName, originalColor);
    return;
  }

  // Replace with inline input + save button
  titleEl.innerHTML = `
  <div class="rename-inline">
    <input type="text" class="edit-input"
           id="rename-input-${trackName}"
           value="${trackName}"
           data-original="${trackName}" />

      <input type="color" class="color-picker"
            id="edit-color-${trackName}"
             value="${originalColor}"
            >

   <button class="save-btn"
        data-track="${trackName}"
        data-color="${originalColor}"
        title="Save">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 122.73 122.88" fill="currentColor">
        <path d="M109.5,113.68L109.5,113.68l-6.09,0c-0.4,0-0.73-0.32-0.73-0.72V69.48l0-0.1
                 c0-0.9-0.17-1.65-0.49-2.22c-0.06-0.11-0.14-0.22-0.2-0.31c-0.06-0.09-0.16-0.18-0.23-0.27l-0.02-0.02
                 c-0.3-0.3-0.68-0.53-1.12-0.69l-0.25-0.07l-0.04-0.01l-0.01,0c-0.41-0.11-0.88-0.17-1.38-0.17h-0.05l-0.08,0H36.75
                 c-0.89,0-1.62,0.17-2.18,0.49l-0.02,0.01l-0.27,0.17l-0.04,0.04c-0.09,0.07-0.18,0.15-0.27,0.23l-0.02,0.02l-0.01,0.01
                 c-0.62,0.63-0.92,1.57-0.92,2.82l0,0.04l0,43.54h0c0,0.4-0.33,0.72-0.73,0.72l-9.85,0c0,0,0,0,0,0c-0.19,0-0.38-0.08-0.51-0.21
                 L9.87,101.41c-0.18-0.14-0.29-0.36-0.29-0.59l0-87.91l0-0.08c0-0.83,0.15-1.52,0.44-2.07l0,0c0.05-0.11,0.11-0.2,0.17-0.29
                 l0.02-0.03c0.07-0.11,0.19-0.18,0.25-0.29l0.01-0.02l0.02-0.02l0,0c0.25-0.25,0.57-0.45,0.92-0.59l0.04-0.02l0.02-0.01l0.02-0.01
                 l0.18-0.06v0l0.01-0.01c0.42-0.14,0.9-0.2,1.44-0.21l0.09-0.01l26.21,0c0.4,0,0.73,0.32,0.73,0.72v28.75c0,0.52,0.05,1.03,0.13,1.5
                 c0.09,0.46,0.15,0.98,0.39,1.34l0.01,0.02l0,0.01v0c0.18,0.44,0.42,0.87,0.67,1.25c0.24,0.37,0.56,0.77,0.9,1.13l0.02,0.02l0,0.01
                 l0.01,0c0.48,0.5,0.94,1.15,1.62,1.27l0.01,0l0.01,0l0.01,0.01l0.32,0.17l0,0l0.4,0.18v0l0.01,0l0,0l0,0v0
                 c0.33,0.14,0.67,0.26,1,0.34l0.01,0l0.03,0l0.01,0l0.03,0l0.26,0.05v0c0.45,0.09,0.93,0.14,1.42,0.14l0.02,0h47.8
                 c1.03,0,1.98-0.18,2.85-0.53l0.01-0.01c0.87-0.36,1.67-0.9,2.39-1.61l0.03-0.03c0.36-0.36,0.69-0.75,0.96-1.16
                 c0.26-0.38,0.58-0.76,0.66-1.22l0-0.01l0.01-0.01l0.01-0.02c0.18-0.43,0.34-0.88,0.41-1.34l0-0.03c0.09-0.47,0.13-0.97,0.13-1.49
                 V9.92c0-0.4,0.33-0.73,0.73-0.73h6c0.58,0,1.09,0.07,1.54,0.21c0.48,0.15,0.89,0.39,1.2,0.7c0.68,0.67,0.88,1.67,0.9,2.59l0.01,0.09
                 v0.05l0,0.02v97.19c0,0.56-0.07,1.07-0.21,1.51l-0.01,0.03v0l0,0.02l-0.08,0.22l0,0l-0.02,0.06l-0.09,0.2l-0.01,0.04l-0.02,0.04
                 l0,0l-0.03,0.06l-0.15,0.22l0,0l-0.05,0.08l-0.14,0.17l-0.06,0.07c-0.15,0.16-0.33,0.3-0.53,0.42c-0.17,0.1-0.36,0.19-0.55,0.26
                 l-0.06,0.02c-0.16,0.05-0.34,0.1-0.53,0.14l-0.02,0l-0.01,0l-0.02,0l-0.09,0.01l-0.02,0l0,0l-0.02,0c-0.22,0.03-0.49,0.05-0.76,0.06
                 H109.5L109.5,113.68z M53.93,104.43c-1.66,0-3-1.34-3-3c0-1.66,1.34-3,3-3h31.12c1.66,0,3,1.34,3,3c0,1.66-1.34,3-3,3H53.93
                 L53.93,104.43z M53.93,89.03c-1.66,0-3-1.34-3-3s1.34-3,3-3h31.12c1.66,0,3,1.34,3,3s-1.34,3-3,3H53.93L53.93,89.03z
                 M94.03,9.39l-45.32-0.2v25.86H48.7c0,0.46,0.06,0.86,0.17,1.2c0.03,0.06,0.04,0.1,0.07,0.15c0.09,0.23,0.22,0.44,0.4,0.61
                 l0.03,0.03v0c0.06,0.06,0.11,0.1,0.17,0.15c0.06,0.05,0.13,0.09,0.2,0.14c0.39,0.23,0.92,0.34,1.58,0.34v0l40.1,0.25v0l0,0v0
                 c0.91,0,1.57-0.21,1.98-0.63c0.42-0.43,0.63-1.1,0.63-2.02h0V9.39L94.03,9.39z M41.91,73.23h53.07v0c0.35,0,0.65,0.29,0.65,0.64
                 l0,39.17c0,0.35-0.29,0.65-0.65,0.65H41.91v0c-0.35,0-0.65-0.29-0.65-0.64l0-39.17C41.26,73.52,41.56,73.23,41.91,73.23
                 L41.91,73.23L41.91,73.23z M9.68,0h104.26c4.91,0,8.79,3.86,8.79,8.79V114c0,4.95-3.9,8.88-8.79,8.88l-96.61,0l-0.24-0.25
                 L1.05,106.6L0,105.9V8.76C0,3.28,4.81,0,9.68,0L9.68,0L9.68,0z"/>
      </svg>
    </button>
  </div>
`;
  // Hide all action buttons while editing
  actionsEl.style.display = "none"; // hide Edit/Delete buttons

  const inputEl = document.getElementById(`rename-input-${trackName}`);
  inputEl.focus();

  // ----- Setup event listeners -----
  const handleSave = async (e) => {
    if (e.target.closest(".save-btn")) {
      const btn = e.target.closest(".save-btn");
      const tn = btn.dataset.track;
      const oldColor = btn.dataset.color;

      await confirmEdit(tn, oldColor);
      removeListeners(trackName); // cleanup after saving
    }
  };

  const handleClickOutside = (event) => {
    if (!trackEl.contains(event.target)) {
      cancelEdit(trackName, originalColor);
      removeListeners(trackName); // cleanup after cancel
    }
  };

  document.addEventListener("click", handleSave);
  document.addEventListener("click", handleClickOutside);

  // store refs so we can remove them later
  editListeners[trackName] = { handleSave, handleClickOutside };
}

function removeListeners(trackName) {
  const refs = editListeners[trackName];
  if (!refs) return;
  document.removeEventListener("click", refs.handleSave);
  document.removeEventListener("click", refs.handleClickOutside);
  delete editListeners[trackName];
}

async function confirmEdit(oldName, oldColor) {
  const nameInput = document.getElementById(`rename-input-${oldName}`);
  const colorInput = document.getElementById(`edit-color-${oldName}`);
  if (!nameInput || !colorInput) return;

  const newName = nameInput.value.trim();
  const newColor = colorInput.value;

  shouldReload = false;
  if (newColor && newColor != oldColor) {
    await changeColor(oldName, newColor);
    shouldReload = true;
  }

  if (newName && newName != oldName) {
    await renameTrack(oldName, newName);
    shouldReload = true;
  }

  // Reload page so UI updates
  if (shouldReload) {
    window.location.reload();
  }
}

function cancelEdit(originalName, originalColor) {
  const trackEl = document.getElementById(`track-${originalName}`);
  const titleEl = trackEl.querySelector(".track-header h3");
  const actionsEl = trackEl.querySelector(".track-actions");

  titleEl.textContent = originalName;
  titleEl.style.color = originalColor;
  actionsEl.style.display = "flex";
}

document.querySelectorAll(".track").forEach((trackEl) => {
  trackEl.addEventListener("click", () => {
    const lat = parseFloat(trackEl.dataset.lat);
    const lon = parseFloat(trackEl.dataset.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      const filename = trackEl.id.replace("track-", "");
      const marker = window.MARKERS[filename];

      if (marker) {
        window.MAP.setView(marker.getLatLng(), 50, { animate: true }); // zoom in
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
  const latInput = formPanel.querySelector('input[name="lat"]');
  const lonInput = formPanel.querySelector('input[name="lon"]');

  //
  // --- Panel open/close helpers ---
  //
  function openAddPanel() {
    formPanel.classList.add("active");
    updateMarkerFromInputs();
    document.addEventListener("click", handleClickOutside);
  }

  function closeAddPanel() {
    formPanel.classList.remove("active");
    if (window.hideAddTrackMarker) {
      window.hideAddTrackMarker();
    }
    document.removeEventListener("click", handleClickOutside);
  }

  function toggleAddPanel() {
    if (formPanel.classList.contains("active")) {
      closeAddPanel();
    } else {
      // tell auth.js to close itself
      document.dispatchEvent(new CustomEvent("panel:open", { detail: "add" }));
      openAddPanel();
    }
  }

  function handleClickOutside(e) {
    if (!formPanel.contains(e.target) && e.target !== addBtn) {
      closeAddPanel();
    }
  }

  //
  // --- Marker updating ---
  //
  function updateMarkerFromInputs() {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    if (!isNaN(lat) && !isNaN(lon) && window.showAddTrackMarker) {
      window.showAddTrackMarker(lat, lon);
    }
  }

  latInput.addEventListener("input", updateMarkerFromInputs);
  lonInput.addEventListener("input", updateMarkerFromInputs);

  //
  // --- Submit handling ---
  //
  formPanel.querySelector("form.upload").addEventListener("submit", (e) => {
    e.preventDefault();
    addTrack(e.target);

    closeAddPanel(); // close panel after upload
  });

  //
  // --- Button + mutual exclusion ---
  //
  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAddPanel();
  });

  document.addEventListener("panel:open", (e) => {
    if (e.detail !== "add") {
      closeAddPanel();
    }
  });
});
