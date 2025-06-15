// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    // Also save to localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  get(key) {
    // First try memory cache
    let data = this.cache.get(key);
    
    // If not in memory, try localStorage
    if (!data) {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        try {
          data = JSON.parse(stored);
          // Restore to memory cache
          this.cache.set(key, data);
        } catch (e) {
          console.warn('Failed to parse cached data:', e);
          return null;
        }
      }
    }

    // Check if data exists and is still valid
    if (data && Date.now() - data.timestamp < CACHE_DURATION) {
      return data.value;
    }

    // Clear invalid cache
    if (data) {
      this.clear(key);
    }
    return null;
  }

  clear(key) {
    this.cache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  clearAll() {
    this.cache.clear();
    // Clear only our cache items from localStorage
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('cache_')) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Create a singleton instance
const cache = new Cache();

export default cache;
