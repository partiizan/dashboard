const FEEDS = {
  brent: "https://croncopia.com/api/energy/brent_crude.json",
  gold: "https://croncopia.com/api/metals/gold.json",
  silver: "https://croncopia.com/api/metals/silver.json",
  platinum: "https://croncopia.com/api/metals/platinum.json"
};

const money = (value, decimals = 2) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

function extractPrice(asset, data) {
  if (asset === "brent") return Number(data?.price);
  return Number(data?.price?.troy_ounce ?? data?.price);
}

function formatFeedMeta(data) {
  const parts = [];
  if (data?.timestamp) {
    const d = new Date(data.timestamp);
    if (!Number.isNaN(d.getTime())) {
      parts.push(`Feed ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    }
  }
  if (data?.sources != null) {
    parts.push(`${data.sources} source${data.sources === 1 ? "" : "s"}`);
  }
  return parts.join(" • ") || "Latest available quote";
}

function paint(asset, data) {
  const priceEl = document.getElementById(`${asset}Price`);
  const detailEl = document.getElementById(`${asset}Change`);
  const price = extractPrice(asset, data);

  if (!Number.isFinite(price)) throw new Error(`Invalid ${asset} price`);

  priceEl.textContent = `$${money(price, asset === "silver" ? 3 : 2)}`;
  detailEl.textContent = formatFeedMeta(data);
  detailEl.className = "change flat";
}

async function fetchFeed(asset, url) {
  const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${asset}: HTTP ${response.status}`);
  const data = await response.json();
  paint(asset, data);
  return data;
}

async function refreshMarkets() {
  const statusText = document.getElementById("statusText");
  const lastUpdated = document.getElementById("lastUpdated");
  const dot = document.querySelector(".status-dot");

  statusText.textContent = "Refreshing markets…";
  dot.style.background = "#fde68a";

  const entries = Object.entries(FEEDS);
  const results = await Promise.allSettled(
    entries.map(([asset, url]) => fetchFeed(asset, url))
  );

  const ok = results.filter(r => r.status === "fulfilled").length;

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(entries[index][0], result.reason);
    }
  });

  if (ok === entries.length) {
    statusText.textContent = "Market data loaded";
    dot.style.background = "#86efac";
  } else if (ok > 0) {
    statusText.textContent = `Partial market data (${ok}/${entries.length})`;
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

// Croncopia refreshes its commodity data periodically; checking every 10 minutes
// keeps the dashboard current without hammering the static feed.
setInterval(refreshMarkets, 10 * 60 * 1000);
setInterval(refreshNHC, 15 * 60 * 1000);
setInterval(clock, 60 * 1000);
