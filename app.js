function refreshNHC() {
  const img = document.getElementById("nhcMap");
  if (!img) return;
  img.src = `https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png?t=${Date.now()}`;
}

function setFuelChange(el, current, previous) {
  if (!el || !Number.isFinite(current) || !Number.isFinite(previous)) return;
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  el.textContent = `${sign}$${Math.abs(delta).toFixed(4)} vs yesterday`;
  el.className = "fuel-change " + (delta > 0 ? "up" : delta < 0 ? "down" : "flat");
}

async function refreshFuelPrices() {
  try {
    const response = await fetch(`./data/fuel-prices.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Fuel data HTTP ${response.status}`);
    const data = await response.json();

    const gas = Number(data?.regular?.current);
    const gasPrev = Number(data?.regular?.yesterday);
    const diesel = Number(data?.diesel?.current);
    const dieselPrev = Number(data?.diesel?.yesterday);

    if (Number.isFinite(gas)) document.getElementById("gasPrice").textContent = `$${gas.toFixed(4)}`;
    if (Number.isFinite(diesel)) document.getElementById("dieselPrice").textContent = `$${diesel.toFixed(4)}`;

    setFuelChange(document.getElementById("gasChange"), gas, gasPrev);
    setFuelChange(document.getElementById("dieselChange"), diesel, dieselPrev);

    const dateLabel = data?.date ? `AAA average • ${data.date}` : "AAA daily national average";
    document.getElementById("gasDate").textContent = dateLabel;
    document.getElementById("dieselDate").textContent = dateLabel;
  } catch (err) {
    console.error("Fuel price load failed", err);
    document.getElementById("gasChange").textContent = "Fuel data unavailable";
    document.getElementById("gasChange").className = "fuel-change flat";
    document.getElementById("dieselChange").textContent = "Fuel data unavailable";
    document.getElementById("dieselChange").className = "fuel-change flat";
  }
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
refreshFuelPrices();
updateStatus();
clock();

setInterval(refreshNHC, 15 * 60 * 1000);
setInterval(refreshFuelPrices, 60 * 60 * 1000);
setInterval(updateStatus, 5 * 60 * 1000);
setInterval(clock, 60 * 1000);
