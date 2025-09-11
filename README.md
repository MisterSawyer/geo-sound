# Geo-Sound

<https://arcast.site/geo-sound/>

A Flask-based web application for uploading, managing, and exploring MP3 tracks on an interactive map.
Each track has metadata (title, owner, latitude, longitude) and is displayed both in a list and as a Leaflet marker on the map.

## ✨ Features

* Upload MP3 files with metadata (title, owner, lat/lon)

* Display all tracks in a list with embedded audio players

* Interactive map (Leaflet) showing tracks by geographic location

* Delete tracks (removes both .mp3 and .json metadata)

---

## 📡 Endpoints

**Main landing page with map and track list.**

```bash
GET /geo-sound/
```

</br>

**Upload a new MP3 track with metadata.**

```bash
POST /geo-sound/api/upload
```

</br>

**Delete a track (MP3 + metadata).**

```bash
DELETE /geo-sound/api/delete/<name>
```

</br>

**Stream/play MP3 file.**

```bash
GET /geo-sound/sound/<name>
```

---

## 📜 License

BSD-2-Clause
