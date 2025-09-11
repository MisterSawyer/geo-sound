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