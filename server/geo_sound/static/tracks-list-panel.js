function closeTracksList() {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");

  tracksListPanel.classList.remove("translate-x-0");
  tracksListPanel.classList.add("translate-x-full");
  burger.classList.remove("header-btn-pressed");

  setTimeout(() => {
    if (window.MAP) window.MAP.invalidateSize();
  }, 310);
}

function openTracksList() {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");
  document.dispatchEvent(new CustomEvent("panel:open", { detail: "tracks" }));
  tracksListPanel.classList.remove("translate-x-full");
  tracksListPanel.classList.add("translate-x-0");
  burger.classList.add("header-btn-pressed");

  setTimeout(() => {
    if (window.MAP) window.MAP.invalidateSize();
  }, 310);
}

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const tracksListPanel = document.getElementById("tracks-list-panel");

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent("panel:open", { detail: "tracks" }));

    if (tracksListPanel.classList.contains("translate-x-full")) {
      openTracksList();
    } else {
      closeTracksList();
    }
  });

  document.addEventListener("panel:open", (e) => {
    if (e.detail !== "tracks") {
      closeTracksList();
    }
  });
});

// --- Filter toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-filter");
  const filterSection = document.getElementById("tracks-filter");

  const inputTitle = document.getElementById("filter-title");
  const inputOwner = document.getElementById("filter-owner");
  const inputFrom = document.getElementById("filter-date-from");
  const inputTo = document.getElementById("filter-date-to");
  const clearBtn = document.getElementById("filter-clear");

  if (!toggleBtn || !filterSection) return;

  // ---- Toggle visibility of the filter panel ----
  toggleBtn.addEventListener("click", () => {
    filterSection.classList.toggle("hidden");

    if (filterSection.classList.contains("hidden")) {
      toggleBtn.textContent = "FILTER";
    } else {
      toggleBtn.textContent = "HIDE FILTER";
    }
  });

  // ---- Check if filters are active and colorize button ----
  function updateFilterButtonColor() {
    const anyActive =
      inputTitle.value.trim() !== "" ||
      inputOwner.value.trim() !== "" ||
      inputFrom.value !== "" ||
      inputTo.value !== "";

    if (anyActive) {
      // Turn button green
      toggleBtn.classList.add("bg-green-600", "text-white", "border-green-700");
      toggleBtn.classList.remove("hover:bg-gray-100");
    } else {
      // Reset to default gray
      toggleBtn.classList.remove("bg-green-600", "text-white", "border-green-700");
      toggleBtn.classList.add("hover:bg-gray-100");
    }
  }

  // Attach listeners to all filter inputs
  [inputTitle, inputOwner, inputFrom, inputTo].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", updateFilterButtonColor);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      inputTitle.value = "";
      inputOwner.value = "";
      inputFrom.value = "";
      inputTo.value = "";
      updateFilterButtonColor();
    });
  }

  // Initial refresh (in case filters pre-filled by browser)
  updateFilterButtonColor();
});

// --- Filters: title, owner, date range ---
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("filter-title");
  const ownerInput = document.getElementById("filter-owner");
  const dateFromInput = document.getElementById("filter-date-from");
  const dateToInput = document.getElementById("filter-date-to");
  const clearBtn = document.getElementById("filter-clear");

  if (!titleInput || !ownerInput || !dateFromInput || !dateToInput) {
    // filter UI not present (older template)
    return;
  }

  function applyFilters() {
    const titleQuery = titleInput.value.trim().toLowerCase();
    const ownerQuery = ownerInput.value.trim().toLowerCase();
    const dateFrom = dateFromInput.value; // 'YYYY-MM-DD' or ''
    const dateTo = dateToInput.value;     // 'YYYY-MM-DD' or ''

    const cards = document.querySelectorAll("#tracks-list-panel .track-card");

    cards.forEach((card) => {
      const titleEl = card.querySelector(".track-title");
      const recordedEl = card.querySelector("[id^='track-recorded-']");

      const cardTitle = titleEl ? titleEl.textContent.toLowerCase() : "";
      const cardOwner = (card.dataset.owner || "").toLowerCase();
      const recordedRaw =
        recordedEl && recordedEl.dataset.recorded
          ? recordedEl.dataset.recorded
          : "";

      // Try to normalize recorded_at → 'YYYY-MM-DD'
      let recordedDate = "";
      if (recordedRaw) {
        // datetime-local format: '2025-11-25T13:37' → take date part
        recordedDate = recordedRaw.slice(0, 10);
      }

      let visible = true;

      // Filter by title substring
      if (titleQuery && !cardTitle.includes(titleQuery)) {
        visible = false;
      }

      // Filter by owner substring
      if (visible && ownerQuery && !cardOwner.includes(ownerQuery)) {
        visible = false;
      }

      // Filter by date range (inclusive)
      if (visible && (dateFrom || dateTo)) {
        if (!recordedDate) {
          // If track has no recorded date, hide when date filter is active
          visible = false;
        } else {
          if (dateFrom && recordedDate < dateFrom) {
            visible = false;
          }
          if (dateTo && recordedDate > dateTo) {
            visible = false;
          }
        }
      }

      card.style.display = visible ? "" : "none";
    });
  }

  const filterInputs = [titleInput, ownerInput, dateFromInput, dateToInput];
  filterInputs.forEach((input) => {
    input.addEventListener("input", applyFilters);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      titleInput.value = "";
      ownerInput.value = "";
      dateFromInput.value = "";
      dateToInput.value = "";
      applyFilters();
    });
  }
});

window.openTracksList = openTracksList;
