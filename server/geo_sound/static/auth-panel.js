document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");
  const authPanel = document.querySelector(".auth-panel");

  function closeAuthPanel() {
    authPanel.classList.remove("active");
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

    authPanel.classList.toggle("active");
    if (authPanel.classList.contains("active")) {
      document.addEventListener("click", handleAuthOutside);
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