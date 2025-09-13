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
