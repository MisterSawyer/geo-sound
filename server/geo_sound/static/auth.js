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
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const statusEl = document.getElementById("auth-status");

  statusEl.innerText = ""; // clear previous message
  statusEl.className = "text-sm"; // reset classes

  try {
    const res = await fetch(window.BASE_AUTH_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    statusEl.innerText = data.message || data.error || "Unknown response";

    if (res.ok) {
      statusEl.classList.add("text-green-600");
      login();
    } else {
      statusEl.classList.add("text-red-600");
    }
  } catch (err) {
    console.error("Register error:", err);
    statusEl.innerText = "Registration failed. Please try again.";
    statusEl.classList.add("text-red-600");
  }
}

async function login() {
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const statusEl = document.getElementById("auth-status");

  statusEl.innerText = ""; // clear previous message
  statusEl.className = "text-sm"; // reset classes

  try {
    const res = await fetch(window.BASE_AUTH_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      setToken(data.access_token, data.username);
      document.getElementById(
        "auth-logged-in-status"
      ).innerText = `✅ Logged in as ${data.username}`;
      updateAuthUI();

      statusEl.innerText = "Login successful!";
      statusEl.classList.add("text-green-600");
    } else {
      statusEl.innerText = data.error || "Login failed";
      statusEl.classList.add("text-red-600");
    }
  } catch (err) {
    console.error("Login error:", err);
    statusEl.innerText = "Login failed. Please try again.";
    statusEl.classList.add("text-red-600");
  }
}

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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
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

async function checkAuth() {
  const token = getToken();
  if (!token) return;

  const res = await fetch(window.BASE_AUTH_ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById(
      "auth-logged-in-status"
    ).innerText = `👋 Welcome back, ${data.username}`;
  } else {
    clearToken();
  }
}

function updateAuthUI() {
  const token = getToken();
  const username = getUsername();
  const authAdminBadge = document.getElementById("auth-admin-badge");

  const authContent = document.getElementById("auth-content");
  const authLoggedIn = document.getElementById("auth-logged-in");
  const addBtn = document.getElementById("add-btn");

  // hide all track action panels first
  document.querySelectorAll("[id^='track-actions-']").forEach((el) => {
    el.style.display = "none";
  });

  if (token) {
    authContent.style.display = "none";
    authLoggedIn.style.display = "block";

    if (addBtn) addBtn.style.display = "inline-block";

    // --- CHECK ADMIN STATUS ---
    fetch(window.BASE_AUTH_ME_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const isAdmin = data.is_admin;

        // toggle badge
        if (isAdmin) authAdminBadge.classList.remove("hidden");
        else authAdminBadge.classList.add("hidden");

        // --- SHOW EDIT BUTTONS ---
        document.querySelectorAll("[id^='track-']").forEach((track) => {
          const trackName = track.id.replace("track-", "");
          const actionsEl = document.getElementById(
            `track-actions-${trackName}`
          );

          // admins see all
          if (actionsEl && isAdmin) {
            actionsEl.style.display = "flex";
            return;
          }
          // normal users only see their own
          if (actionsEl && track.dataset.owner === username) {
            actionsEl.style.display = "flex";
          }
        });
      });

  } else {
    authContent.style.display = "block";
    authLoggedIn.style.display = "none";

    authAdminBadge.classList.add("hidden");
    if (addBtn) addBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);
document.addEventListener("DOMContentLoaded", checkAuth);
