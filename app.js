const ENDPOINTS = {
  metals: "https://goldmarketdaily.com/wp-json/gmd/v1/metals",
  brentCurrent: "https://croncopia.com/api/energy/brent_crude.json",
  brentDaily: "https://snapdata.dev/api/v1/crude/world/latest.json"
};

const money = (value, decimals = 2) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

function paintChange(asset, current, previous, decimals = 2) {
  const priceEl = document.getElementById(`${asset}Price`);
  const changeEl = document.getElementById(`${asset}Change`);

  if (!Number.isFinite(current)) throw new Error(`Invalid ${asset} price`);

  priceEl.textContent = `$${money(current, decimals)}`;

  if (!Number.isFinite(previous)) {
    changeEl.textContent = "Previous close unavailable";
    changeEl.className = "change flat";
    return;
  }

  const delta = current - previous;
  const pct = previous !== 0 ? (delta / previous) * 100 : null;
  const sign = delta > 0 ? "+" : "";

  changeEl.textContent = pct == null
    ? `${sign}$${money(delta, decimals)}`
    : `${sign}$${money(delta, decimals)} (${sign}${money(pct, 2)}%)`;

  changeEl.className = "change " + (delta > 0 ? "up" : delta < 0 ? "down" : "flat");
}

async function fetchJson(url) {
  const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function refreshMetals() {
  const data = await fetchJson(ENDPOINTS.metals);
  const metals = data?.metals || {};
  const prev = data?.prev_close || {};

  paintChange("gold", Number(metals.gold), Number(prev.gold), 2);
  paintChange("silver", Number(metals.silver), Number(prev.silver), 3);
  paintChange("platinum", Number(metals.platinum), Number(prev.platinum), 2);
}

async function refreshBrent() {
  const [currentData, dailyData] = await Promise.all([
    fetchJson(ENDPOINTS.brentCurrent),
    fetchJson(ENDPOINTS.brentDaily)
  ]);

  const current = Number(currentData?.price);
  const obs = (dailyData?.observations || []).find(
    o => o?.instrument_id === "BRENT.USD.BBL"
  );

  // Snapdata explicitly provides the previous trading day's close/reference.
  // We compare that with Croncopia's latest Brent quote so the dashboard keeps
  // an intraday-ish current value while still showing change from prior close.
  const previous = Number(obs?.prev_close ?? obs?.close ?? obs?.value);
  paintChange("brent", current, previous, 2);
}

async function refreshMarkets() {
  const statusText = document.getElementById("statusText");
  const lastUpdated = document.getElementById("lastUpdated");
  const dot = document.querySelector(".status-dot");

  statusText.textContent = "Refreshing markets…";
  dot.style.background = "#fde68a";

  const results = await Promise.allSettled([
    refreshBrent(),
    refreshMetals()
  ]);

  const brentOk = results[0].status === "fulfilled";
  const metalsOk = results[1].status === "fulfilled";

  results.forEach(result => {
    if (result.status === "rejected") console.error(result.reason);
  });

  if (brentOk && metalsOk) {
    statusText.textContent = "Market data loaded";
    dot.style.background = "#86efac";
  } else if (brentOk || metalsOk) {
    statusText.textContent = "Partial market data";
    dot.style.background = "#fde68a";
  } else {
    statusText.textContent = "Market feed unavailable";
    dot.style.background = "#fca5a5";
  }

  lastUpdated.textContent = `Checked ${new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  })}`;
}

function refreshNHC() {
  document.getElementById("nhcMap").src =
    `https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png?t=${Date.now()}`;
}

function clock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
}

document.getElementById("refreshBtn").onclick = refreshMarkets;
refreshMarkets();
refreshNHC();
clock();

setInterval(refreshMarkets, 10 * 60 * 1000);
setInterval(refreshNHC, 15 * 60 * 1000);
setInterval(clock, 60 * 1000);
