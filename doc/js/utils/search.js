import { renderRepoCard } from '../components/carousel.js';
import { fetchUserProfile, searchGitHubUsers } from '../api/github.js';
import { createUserProfileTab } from '../components/tabs.js';

// Enhanced search functionality
export const searchRepos = (query, repos, container) => {
  // Clear container first
  container.innerHTML = '';

  // Handle empty repos array
  if (!repos || repos.length === 0) {
    container.innerHTML = '<p>No repositories available.</p>';
    return;
  }

  const searchTerm = query.toLowerCase().trim();
  
  // If search is empty, show all repos
  if (!searchTerm) {
    repos.forEach(repo => renderRepoCard(repo, container));
    return;
  }

  // Filter repos based on search term
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm))
  );
  
  if (filteredRepos.length === 0) {
    container.innerHTML = `<p>No repositories found matching "${query}"</p>`;
    return;
  }

  filteredRepos.forEach(repo => renderRepoCard(repo, container));
};

// Initialize GitHub user search functionality
export function initUserSearch() {
  const searchInput = document.getElementById('github-user-search');
  const searchResults = document.getElementById('search-results');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    // Show search results
    searchResults.style.display = 'grid';

    searchTimeout = setTimeout(async () => {
      const { items } = await searchGitHubUsers(query);
      
      searchResults.innerHTML = items.length ? '' : '<p>No users found matching your search.</p>';
      items.forEach(user => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${user.avatar_url}" alt="${user.login}" style="width: 50px; height: 50px; border-radius: 50%;">
          <h3>${user.login}</h3>
          <button class="view-profile-btn">View Profile</button>
        `;

        card.querySelector('.view-profile-btn').addEventListener('click', async () => {
          try {
            const { userData, repos, orgs } = await fetchUserProfile(user.login);
            displayUserProfile(userData, repos, orgs);
          } catch (error) {
            searchResults.innerHTML = `<p>Error loading profile: ${error.message}</p>`;
          }
        });

        searchResults.appendChild(card);
      });
    }, 300);
  });
}

// Initialize repository search functionality
export function initRepoSearch() {
  const searchInput = document.getElementById('repo-search');
  
  searchInput.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.browser-tab.active');
    const activeView = document.querySelector('.browser-view.active');
    const query = e.target.value;
    
    if (!activeTab || !activeView) return;

    // Clear any existing search timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Add debouncing to prevent too many searches
    window.searchTimeout = setTimeout(() => {
      const container = activeView.querySelector('.card-container');
      if (!container) return;

      // Get current repos from container
      const currentRepos = Array.from(container.querySelectorAll('.card')).map(card => ({
        name: card.querySelector('h3').textContent,
        description: card.querySelector('p').textContent,
        html_url: card.querySelector('a').href
      }));

      searchRepos(query, currentRepos, container);
    }, 300);
  });
}

export function displayUserProfile(userData, repos, orgs) {
  // Check if tab already exists
  const existingTab = document.querySelector(`.browser-tab[data-view="user-${userData.login}"]`);
  if (existingTab) {
    existingTab.click();
    return;
  }

  // Create new tab and view
  const { tab, view } = createUserProfileTab(userData);

  // Display repos
  const userRepos = view.querySelector(`#user-${userData.login}-repos`);
  repos.forEach(repo => renderRepoCard(repo, userRepos));

  // Display orgs
  const userOrgs = view.querySelector(`#user-${userData.login}-orgs`);
  orgs.forEach(org => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${org.avatar_url}" alt="${org.login}" style="width: 50px; height: 50px; border-radius: 4px;">
      <div class="org-info">
        <h3>${org.login}</h3>
        <a href="https://github.com/${org.login}" target="_blank" rel="noopener noreferrer">View Organization</a>
      </div>
    `;
    userOrgs.appendChild(card);
  });

  // Add tab switching functionality
  view.querySelectorAll('.tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      view.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      view.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tabBtn.classList.add('active');
      const contentId = `user-${userData.login}-${tabBtn.dataset.tab}`;
      document.getElementById(contentId).classList.add('active');
    });
  });

  // Activate the new tab
  tab.click();
}
