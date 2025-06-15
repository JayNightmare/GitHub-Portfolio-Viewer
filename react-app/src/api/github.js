import cache from '../utils/cache.js';

const API_BASE_URL = 'https://api.github.com';

export const fetchGitHubAPI = async (endpoint) => {
  // Check cache first
  const cachedData = cache.get(endpoint);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetTime = response.headers.get('X-RateLimit-Reset');

    if (remaining === '0') {
      const resetDate = new Date(resetTime * 1000);
      throw new Error(`API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the successful response
    cache.set(endpoint, data);
    
    return data;
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw error;
  }
};

export const fetchUserRepos = async (username) => {
  return await fetchGitHubAPI(`/users/${username}/repos?sort=updated&per_page=100`);
};

export const fetchOrgRepos = async (orgName) => {
  try {
    return await fetchGitHubAPI(`/orgs/${orgName}/repos?sort=updated&per_page=100`);
  } catch (error) {
    console.error('Error fetching org repos:', error);
    return [];
  }
};

export const searchGitHubUsers = async (query) => {
  try {
    // Don't cache search results as they should be fresh
    const response = await fetch(`${API_BASE_URL}/search/users?q=${query}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    return { items: [] };
  }
};

export const fetchUserProfile = async (username) => {
  try {
    // Use Promise.all to fetch all data in parallel
    const [userData, repos, orgs] = await Promise.all([
      fetchGitHubAPI(`/users/${username}`),
      fetchGitHubAPI(`/users/${username}/repos?sort=updated&per_page=100`),
      fetchGitHubAPI(`/users/${username}/orgs`)
    ]);

    return { userData, repos, orgs };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Clear cache when rate limit is about to reset
export const setupCacheClearing = () => {
  const checkRateLimit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rate_limit`);
      const data = await response.json();
      const resetTime = data.rate.reset * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (resetTime > now) {
        // Schedule cache clear when rate limit resets
        setTimeout(() => {
          cache.clearAll();
          console.log('Cache cleared after rate limit reset');
        }, resetTime - now);
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  };

  // Check rate limit on startup
  checkRateLimit();
};
