import API from "./Api";

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const getCachedData = async (key, url) => {
  const cachedStr = localStorage.getItem(key);
  const now = Date.now();
  
  let cached = null;
  if (cachedStr) {
    try {
      cached = JSON.parse(cachedStr);
    } catch (_) {
      localStorage.removeItem(key);
    }
  }

  // If we have cache and it's not expired
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    if (key === "departments") {
      try {
        const metadataRes = await API.get("/departments/count");
        if (metadataRes.data.success && metadataRes.data.count === cached.data.length) {
          return cached.data;
        }
      } catch (err) {
        console.warn("Failed to verify department count, falling back to cache", err);
        return cached.data;
      }
    } else {
      return cached.data;
    }
  }

  // Cache miss, expired, or count mismatch
  try {
    const res = await API.get(url);
    if (res.data.success) {
      const dataToCache = res.data.data;
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: dataToCache
      }));
      return dataToCache;
    }
  } catch (err) {
    console.error(`Failed to fetch fresh data for key ${key}:`, err);
    if (cached) {
      console.warn(`Falling back to expired cache for key ${key}`);
      return cached.data;
    }
  }
  return [];
};
