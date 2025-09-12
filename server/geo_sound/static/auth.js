const authBtn = document.getElementById("auth-btn"); // the header button you created
const authPanel = document.querySelector(".auth-panel");

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

function setToken(token, username) {
  localStorage.setItem("username", username);
  localStorage.setItem("auth_token", token);
}

function getToken() {
  return localStorage.getItem("auth_token");
}

function getUsername() {
  return localStorage.getItem("username");
}

function clearToken() {
  localStorage.removeItem("username");
  localStorage.removeItem("auth_token");
}

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(window.BASE_AUTH_REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("auth-status").innerText = data.message || data.error;
}


function updateAuthUI() {
  const token = getToken();
  const authContent = document.querySelector(".auth-content");
  const authLoggedIn = document.querySelector(".auth-logged-in");

    const addBtn = document.getElementById("add-btn");
    const username = getUsername();

    document.querySelectorAll(".track-actions").forEach(el => {
      el.style.display = "none";
    });

  if (token) {
    authContent.style.display = "none";
    authLoggedIn.style.display = "block";

    if (addBtn) addBtn.style.display = "inline-block";

    // If logged in and we know username → show only owned track actions
    if (username) {
        
      document.querySelectorAll(".track").forEach((track) => {
        if (track.dataset.owner === username) {
           track.querySelectorAll(".track-actions").forEach(el => {
             el.style.display = "flex";
           })
        }
      });
    }

  } else {
    authContent.style.display = "block";
    authLoggedIn.style.display = "none";

    if (addBtn) addBtn.style.display = "none";
  }
}

// Call when page loads
document.addEventListener("DOMContentLoaded", updateAuthUI);

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(window.BASE_AUTH_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok && data.access_token) {
    setToken(data.access_token, data.username);
    document.getElementById("auth-logged-in-status").innerText = `✅ Logged in as ${data.username}`;
    updateAuthUI();
  } else {
    document.getElementById("auth-status").innerText = data.error || "Login failed";
  }
}

async function checkAuth() {
  const token = getToken();
  if (!token) return;

  const res = await fetch(window.BASE_AUTH_ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById("auth-logged-in-status").innerText = `👋 Welcome back, ${data.username}`;
  } else {
    clearToken();
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);

async function logout() {
  const token = getToken();
  if (!token) {
    alert("Not logged in.");
    return;
  }

  try {
    const response = await fetch(window.BASE_AUTH_LOGOUT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Clear token on successful logout
      clearToken();
      updateAuthUI();
    } else {
      alert(data.error || "Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Error logging out.");
  }
}

