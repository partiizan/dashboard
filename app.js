function refreshNHC() {
  const img = document.getElementById("nhcMap");
  if (!img) return;
  img.src = `https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png?t=${Date.now()}`;
}

function updateStatus() {
  const statusText = document.getElementById("statusText");
  const lastUpdated = document.getElementById("lastUpdated");
  const dot = document.querySelector(".status-dot");

  if (statusText) statusText.textContent = "Live market widgets";
  if (dot) dot.style.background = "#86efac";
  if (lastUpdated) {
    lastUpdated.textContent = `Page checked ${new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    })}`;
  }
}

function clock() {
  const el = document.getElementById("clock");
  if (!el) return;
  el.textContent = new Date().toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

refreshNHC();
updateStatus();
clock();

setInterval(refreshNHC, 15 * 60 * 1000);
setInterval(updateStatus, 5 * 60 * 1000);
setInterval(clock, 60 * 1000);
