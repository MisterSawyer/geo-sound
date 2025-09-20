function authHeaders(extra = {}) {
  const token = localStorage.getItem("auth_token");
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// --- CRUD API calls ---
async function deleteTrack(name) {
  if (!confirm(`Are you sure you want to delete '${name}'?`)) return;

  const url = window.BASE_API_DELETE_URL.replace(
    "__NAME__",
    encodeURIComponent(name)
  );
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(),
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
      headers: authHeaders(),
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      window.location.reload();
    } else {
      alert(data.error || "Failed to upload track");
    }
  } catch (err) {
    console.error("Upload failed:", err, response);
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
    if (!response.ok) alert(data.error || "Failed to rename track");
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
    if (!response.ok) alert(data.error || "Failed to update color");
  } catch (err) {
    console.error("Color update failed:", err);
    alert("Error updating color");
  }
}

async function changeLocation(name, lat, lon) {
  const url = window.BASE_API_LOCATION_URL.replace(
    "__NAME__",
    encodeURIComponent(name)
  );
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ lat, lon }),
    });
    const data = await response.json();
    if (!response.ok) alert(data.error || "Failed to update location");
  } catch (err) {
    console.error("Location update failed:", err);
    alert("Error updating location");
  }
}

// --- Editing logic ---
const editListeners = {};
const originalState = {};

function removeListeners(trackName) {
  const refs = editListeners[trackName];
  if (!refs) return;
  document.removeEventListener("click", refs.handleSave);
  document.removeEventListener("click", refs.handleClickOutside);
  delete editListeners[trackName];
}

async function confirmEdit(trackName) {
  const titleEl = document.getElementById(`track-title-${trackName}`);
  const actionsEl = document.getElementById(`track-actions-${trackName}`);
  const coordsEl = document.getElementById(`track-coords-${trackName}`);
  if (!titleEl || !actionsEl || !coordsEl) return;

  const colorInput = document.getElementById(`edit-color-${trackName}`);
  if (
    colorInput &&
    colorInput.value &&
    colorInput.value !== titleEl.dataset.color
  ) {
    await changeColor(trackName, colorInput.value);
  }

  const latInput = document.getElementById(`edit-lat-${trackName}`);
  const lonInput = document.getElementById(`edit-lon-${trackName}`);
  if (latInput && lonInput) {
    const newLat = latInput.value;
    const newLon = lonInput.value;
    if (newLat && newLon) {
      await changeLocation(trackName, newLat, newLon);
    }
  }

  const nameInput = document.getElementById(`edit-name-${trackName}`);
  if (
    nameInput &&
    nameInput.value.trim() &&
    nameInput.value.trim() !== trackName
  ) {
    await renameTrack(trackName, nameInput.value.trim());
  }

  removeListeners(trackName);
  window.location.reload();
}

function cancelEdit(trackName) {
  const titleEl = document.getElementById(`track-title-${trackName}`);
  const actionsEl = document.getElementById(`track-actions-${trackName}`);
  const coordsEl = document.getElementById(`track-coords-${trackName}`);
  if (!titleEl || !actionsEl || !coordsEl) return;

  const refs = originalState[trackName];
  if (!refs) return;

  titleEl.innerHTML = refs.title;
  actionsEl.innerHTML = refs.actions;
  coordsEl.innerHTML = refs.coords;

  delete originalState[trackName];
  removeListeners(trackName);
}

function toggleEdit(trackName) {
  const titleEl = document.getElementById(`track-title-${trackName}`);
  const actionsEl = document.getElementById(`track-actions-${trackName}`);
  const coordsEl = document.getElementById(`track-coords-${trackName}`);
  if (!titleEl || !actionsEl || !coordsEl) return;

  if (originalState[trackName]) {
    cancelEdit(trackName);
    return;
  }

  // cancel other active edits
  Object.keys(originalState).forEach((key) => {
    if (key !== trackName) cancelEdit(key);
  });

  // snapshot current content
  originalState[trackName] = {
    title: titleEl.innerHTML,
    actions: actionsEl.innerHTML,
    coords: coordsEl.innerHTML,
  };

  const originalColor = titleEl.dataset.color || "#3388ff";
  const originalLat = coordsEl.dataset.lat;
  const originalLon = coordsEl.dataset.lon;

  // --- Title (name + color) ---
  const titleFrag = document
    .getElementById("track-edit-template")
    .content.cloneNode(true);
  const nameInput = titleFrag.querySelector(".edit-name");
  const colorInput = titleFrag.querySelector(".edit-color");
  nameInput.id = `edit-name-${trackName}`;
  nameInput.value = trackName;
  colorInput.id = `edit-color-${trackName}`;
  colorInput.value = originalColor;
  titleEl.innerHTML = ""; // clear old
  titleEl.appendChild(titleFrag);

  // --- Actions (save button) ---
  const actionsFrag = document
    .getElementById("track-edit-actions-template")
    .content.cloneNode(true);
  const saveBtn = actionsFrag.querySelector(".save-btn");
  saveBtn.id = `save-btn-${trackName}`;
  actionsEl.innerHTML = "";
  actionsEl.appendChild(actionsFrag);

  // --- Coordinates ---
  const coordsFrag = document
    .getElementById("track-edit-coords-template")
    .content.cloneNode(true);
  const latInput = coordsFrag.querySelector(".edit-lat");
  const lonInput = coordsFrag.querySelector(".edit-lon");
  latInput.id = `edit-lat-${trackName}`;
  lonInput.id = `edit-lon-${trackName}`;
  latInput.value = originalLat;
  lonInput.value = originalLon;
  coordsEl.innerHTML = "";
  coordsEl.appendChild(coordsFrag);

  nameInput.focus();

  // listeners
  const handleSave = async (e) => {
    if (e.target.closest(`#save-btn-${trackName}`)) {
      await confirmEdit(trackName);
    }
  };
  const handleClickOutside = (event) => {
    if (!document.getElementById(`track-${trackName}`).contains(event.target)) {
      cancelEdit(trackName);
    }
  };

  document.addEventListener("click", handleSave);
  document.addEventListener("click", handleClickOutside);

  editListeners[trackName] = { handleSave, handleClickOutside };
}

// --- Track click -> move map ---
document.querySelectorAll("[id^='track-']").forEach((trackEl) => {
  trackEl.addEventListener("click", () => {
    const name = trackEl.id.replace("track-", "");
    const marker = window.MARKERS[name];
    if (marker) {
      marker.openPopup();
      window.MAP.setView(marker.getLatLng(), 50, { animate: true });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // iterate over window.TRACKS
  window.TRACKS.forEach((track) => {
    const titleEl = document.getElementById(
      `track-title-${track.metadata.title}`
    );
    if (titleEl) {
      titleEl.style.setProperty(
        "--track-color",
        track.metadata.color || "#3388ff"
      );
    }
  });
  //
});

document.addEventListener("DOMContentLoaded", () => {
  window.TRACKS.forEach((track) => {
    const trackEl = document.getElementById(`track-${track.metadata.title}`);

    const titleEl = document.getElementById(
      `track-title-${track.metadata.title}`
    );
    const headerEl = document.getElementById(
      `track-header-${track.metadata.title}`
    );

    if (titleEl && trackEl && headerEl) {
      const pinColor = track.metadata.color || "#3388ff";
      titleEl.style.setProperty("--track-color", pinColor);

      // Parse hex → RGB
      const r = parseInt(pinColor.substr(1, 2), 16);
      const g = parseInt(pinColor.substr(3, 2), 16);
      const b = parseInt(pinColor.substr(5, 2), 16);

      // Relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // Outline only if bright pin (luminance > 0.7)
      if (luminance > 0.5) {
        titleEl.style.textShadow = `
          -1px -1px 0 #555,
           1px -1px 0 #555,
          -1px  1px 0 #333,
           1px  1px 0 #333
        `;
      } else {
        titleEl.style.textShadow = `
          -1px -1px 0 #bbb,
           1px -1px 0 #bbb,
          -1px  1px 0 #bbb,
           1px  1px 0 #bbb
        `;
      }
    }
  });
});
