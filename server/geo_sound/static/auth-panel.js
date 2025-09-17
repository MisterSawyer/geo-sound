document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");
  const authPanel = document.getElementById("auth-panel");

  function openAuthPanel() {
    // Step 1: unhide but keep "closed" state
    authPanel.classList.remove("hidden");
    authPanel.classList.add("panel-closed");
    authBtn.classList.add("header-btn-pressed");

    // Step 2: wait one animation frame, then switch to "open"
    requestAnimationFrame(() => {
      authPanel.classList.remove("panel-closed");
      authPanel.classList.add("panel-open");
    });

    document.addEventListener("click", handleAuthOutside);
  }

  function closeAuthPanel() {
    authPanel.classList.remove("panel-open");
    authPanel.classList.add("panel-closed");
    authBtn.classList.remove("header-btn-pressed");

    authPanel.addEventListener(
      "transitionend",
      () => {
        if (authPanel.classList.contains("panel-closed")) {
          authPanel.classList.add("hidden");
        }
      },
      { once: true }
    );

    document.removeEventListener("click", handleAuthOutside);
  }

  function handleAuthOutside(e) {
    if (!authPanel.contains(e.target) && e.target !== authBtn) {
      closeAuthPanel();
    }
  }

  authBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent("panel:open", { detail: "auth" }));

    if (authPanel.classList.contains("hidden")) {
      openAuthPanel();
    } else {
      closeAuthPanel();
    }
  });

  document.addEventListener("panel:open", (e) => {
    if (e.detail !== "auth") {
      closeAuthPanel();
    }
  });
});
