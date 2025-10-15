function updateMarkerFromInputs() {
  const latInput = document.getElementById("form-lat");
  const lonInput = document.getElementById("form-lon");

  const lat = parseFloat(latInput.value);
  const lon = parseFloat(lonInput.value);
  if (!isNaN(lat) && !isNaN(lon) && window.showAddTrackMarker) {
    window.showAddTrackMarker(lat, lon);
  }
}

function handleClickOutside(e) {
  const formPanel = document.getElementById("add-form-panel");
  const addBtn = document.getElementById("add-btn");
  if (!formPanel.contains(e.target) && e.target !== addBtn) {
    closeAddPanel();
  }
}

//
// --- Panel open/close helpers ---
//
function openAddPanel() {
  const addBtn = document.getElementById("add-btn");
  const formPanel = document.getElementById("add-form-panel");
  formPanel.classList.remove("hidden");
  formPanel.classList.add("panel-closed"); // ensure closed state
  addBtn.classList.add("header-btn-pressed");
  requestAnimationFrame(() => {
    formPanel.classList.remove("panel-closed");
    formPanel.classList.add("panel-open");
  });
  document.dispatchEvent(new CustomEvent("panel:open", { detail: "add" }));
  updateMarkerFromInputs();
  document.addEventListener("click", handleClickOutside);
}

function closeAddPanel() {
  const addBtn = document.getElementById("add-btn");
  const formPanel = document.getElementById("add-form-panel");
  formPanel.classList.remove("panel-open");
  formPanel.classList.add("panel-closed");
  addBtn.classList.remove("header-btn-pressed");

  const latInput = document.getElementById("form-lat");
  const lonInput = document.getElementById("form-lon");
  latInput.value = "";
  lonInput.value = "";

  formPanel.addEventListener(
    "transitionend",
    () => {
      if (formPanel.classList.contains("panel-closed")) {
        formPanel.classList.add("hidden");
      }
    },
    { once: true }
  );

  if (window.hideAddTrackMarker) {
    window.hideAddTrackMarker();
  }
  document.removeEventListener("click", handleClickOutside);
}

function toggleAddPanel() {
  const formPanel = document.getElementById("add-form-panel");
  if (formPanel.classList.contains("hidden")) {
    openAddPanel();
  } else {
    closeAddPanel();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-btn");
  const latInput = document.getElementById("form-lat");
  const lonInput = document.getElementById("form-lon");

  const recordedAtInput = document.getElementById("form-recorded-at");

  //
  // --- Recorded At placeholder color ---
  //
  const updateRecordedAtColor = () => {
    if (!recordedAtInput) return;
    if (recordedAtInput.value.trim() === "") {
      recordedAtInput.classList.remove("placeholder-black");
      recordedAtInput.classList.add("placeholder-gray");
    } else {
      recordedAtInput.classList.remove("placeholder-gray");
      recordedAtInput.classList.add("placeholder-black");
    }
  };

  if(recordedAtInput)recordedAtInput.addEventListener("input", updateRecordedAtColor);
  updateRecordedAtColor(); // initialize on load

  //
  // --- Marker updating ---
  //

  latInput.addEventListener("input", updateMarkerFromInputs);
  lonInput.addEventListener("input", updateMarkerFromInputs);

  //
  // --- Submit handling ---
  //
  const uploadForm = document.getElementById("upload-form");
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTrack(e.target);
    closeAddPanel();
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

window.openAddPanel = openAddPanel;
