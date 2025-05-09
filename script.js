// Helper function to render repository cards
const renderRepoCard = (repo, container) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${repo.description || 'No description provided.'}</p>
    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
  `;
  container.appendChild(card);
};

const username = 'JayNightmare';
const orgs = [
  { name: 'Nexus-Scripture', url: 'https://github.com/Nexus-Scripture' },
  { name: 'Augmented-Perception', url: 'https://github.com/Augmented-Perception' },
];

const folderList = document.getElementById('folder-list');
const projectsList = document.getElementById('projects-list');
const orgsList = document.getElementById('orgs-list');

let currentSelectedLanguage = null;
let allRepos = [];

// Enhanced search functionality
const searchRepos = (query, repos, container) => {
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

// Group repos by language
function groupReposByLanguage(repos) {
  const groups = {};
  repos.forEach(repo => {
    const lang = repo.language || 'Unknown';
    if (!groups[lang]) {
      groups[lang] = [];
    }
    groups[lang].push(repo);
  });
  return groups;
}

// SVG icons for folder states
const FOLDER_ICONS = {
  closed: `<svg class="folder-svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4H4Z"/>
  </svg>`,
  open: `<svg class="folder-svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M2 6C2 4.89543 2.89543 4 4 4H10L12 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6V18H20V8H11.1716L9.17157 6H4Z"/>
  </svg>`
};

function highlightSelectedFolder(li) {
  if (!li) return;
  folderList.querySelectorAll('li').forEach(item => {
    item.classList.remove('selected');
    const icon = item.querySelector('.folder-icon');
    if (icon) icon.innerHTML = FOLDER_ICONS.closed;
  });
  li.classList.add('selected');
  const selectedIcon = li.querySelector('.folder-icon');
  if (selectedIcon) selectedIcon.innerHTML = FOLDER_ICONS.open;
}

// Render repos for selected language in main content
function renderReposForLanguage(language) {
  projectsList.innerHTML = '';
  if (!language) return;
  
  // Filter repos by selected language
  const repos = allRepos.filter(repo => (repo.language || 'Unknown') === language);
  
  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description ? repo.description : 'No description provided.'}</p>
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    `;
    projectsList.appendChild(card);
  });
}

// Render folder list in sidebar
function renderFolderList(languages) {
  folderList.innerHTML = '';
  languages.forEach(language => {
    const li = document.createElement('li');
    li.textContent = language;
    li.classList.add('folder-item');

    const icon = document.createElement('span');
    icon.className = 'folder-icon';
    icon.innerHTML = FOLDER_ICONS.closed;
    li.prepend(icon);

    li.addEventListener('click', () => {
      if (currentSelectedLanguage === language) return;
      currentSelectedLanguage = language;
      highlightSelectedFolder(li);
      renderReposForLanguage(language);
    });

    folderList.appendChild(li);
  });
}

let groupedRepos = {};

async function fetchUserRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    const repos = await response.json();

    // Store all repos for search functionality
    allRepos = repos;

    const groupedRepos = groupReposByLanguage(repos);
    const languages = Object.keys(groupedRepos).sort();

    renderFolderList(languages);

    // Select first language by default
    if (languages.length > 0) {
      currentSelectedLanguage = languages[0];
      highlightSelectedFolder();
      renderReposForLanguage(currentSelectedLanguage);
    }
  } catch (error) {
    projectsList.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
  }
}

async function fetchOrgRepos(orgName) {
  try {
    const response = await fetch(`https://api.github.com/orgs/${orgName}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error('Failed to fetch organization repositories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching org repos:', error);
    return [];
  }
}

function createOrgTab(orgName) {
  const tabsContainer = document.getElementById('browser-tabs');
  const container = document.getElementById('container');
  
  // Create new tab
  const tab = document.createElement('button');
  tab.className = 'browser-tab';
  tab.setAttribute('data-view', `org-${orgName}`);
  tab.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Z"/>
    </svg>
    <span>${orgName}</span>
    <button class="close-btn" title="Close tab">×</button>
  `;

  // Create new view
  const view = document.createElement('div');
  view.id = `org-${orgName}-view`;
  view.className = 'browser-view';
  view.innerHTML = `
    <aside id="org-${orgName}-sidebar" class="sidebar">
      <h2>Languages</h2>
      <ul class="folder-list">
      </ul>
    </aside>
    <main class="main-content">
      <div class="card-container">
        <div class="loading">Loading repositories...</div>
      </div>
    </main>
  `;

  // Add tab and view to DOM
  tabsContainer.appendChild(tab);
  container.appendChild(view);

  return { tab, view };
}

async function displayOrgRepos(orgName) {
  // Check if tab already exists
  const existingTab = document.querySelector(`.browser-tab[data-view="org-${orgName}"]`);
  if (existingTab) {
    existingTab.click();
    return;
  }

  // Create new tab and view
  const { tab, view } = createOrgTab(orgName);

  // Fetch repositories
  const repos = await fetchOrgRepos(orgName);
  
  if (repos.length === 0) {
    view.querySelector('.card-container').innerHTML = '<p>No repositories found.</p>';
    return;
  }

  // Group repos by language
  const groupedRepos = groupReposByLanguage(repos);
  const languages = Object.keys(groupedRepos).sort();

  // Render language folders
  const folderList = view.querySelector('.folder-list');
  languages.forEach(language => {
    const li = document.createElement('li');
    li.textContent = language;
    li.classList.add('folder-item');

    const icon = document.createElement('span');
    icon.className = 'folder-icon';
    icon.textContent = '📁';
    li.prepend(icon);

    li.addEventListener('click', () => {
      // Update selected state
      folderList.querySelectorAll('li').forEach(item => {
        item.classList.remove('selected');
      const icon = item.querySelector('.folder-icon');
      if (icon) icon.innerHTML = FOLDER_ICONS.closed;
      });
      li.classList.add('selected');
      const selectedIcon = li.querySelector('.folder-icon');
    if (selectedIcon) selectedIcon.innerHTML = FOLDER_ICONS.open;

      // Render repos for selected language
      const reposContainer = view.querySelector('.card-container');
      reposContainer.innerHTML = '';
      
      groupedRepos[language].forEach(repo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${repo.name}</h3>
          <p>${repo.description || 'No description provided.'}</p>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        `;
        reposContainer.appendChild(card);
      });
    });

    folderList.appendChild(li);
  });

  // Click first language by default
  if (languages.length > 0) {
    folderList.querySelector('li').click();
  }

  // Add close button functionality
  tab.querySelector('.close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    view.remove();
    tab.remove();
    
    // Switch to organizations view if no other org tabs are open
    const remainingOrgTabs = document.querySelectorAll('.browser-tab[data-view^="org-"]');
    if (remainingOrgTabs.length === 0) {
      document.querySelector('.browser-tab[data-view="organizations"]').click();
    } else {
      remainingOrgTabs[remainingOrgTabs.length - 1].click();
    }
  });

  // Hide all views and deactivate all tabs
  document.querySelectorAll('.browser-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.browser-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  // Handle org tab active state when switching tabs
  document.querySelectorAll('.browser-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove 'active' class from all tabs
      document.querySelectorAll('.browser-tab').forEach(tab => tab.classList.remove('active'));
      // Add 'active' class to the clicked tab
      btn.classList.add('active');
      // Hide all views
      document.querySelectorAll('.browser-view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
      });
      // Show the corresponding view
      const viewId = `${btn.getAttribute('data-view')}-view`;
      const activeView = document.getElementById(viewId);
      if (activeView) {
        activeView.classList.add('active');
        activeView.style.display = 'flex';
      }
    });
  });
}

async function displayOrgs() {
  orgsList.innerHTML = '';
  for (const org of orgs) {
    // Fetch org details to get avatar_url
    let avatarUrl = '';
    try {
      const response = await fetch(`https://api.github.com/orgs/${org.name}`);
      if (response.ok) {
        const orgData = await response.json();
        avatarUrl = orgData.avatar_url;
      }
    } catch (e) {
      avatarUrl = '';
    }
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="left-side">
        <img src="${avatarUrl}" alt="${org.name}" style="width: 50px; height: 50px; border-radius: 4px;">
        <h3>${org.name}</h3>
      </div>
      <button class="view-org-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"></path>
        </svg>
      </button>
    `;
    
    // Add click handler for the button
    card.querySelector('.view-org-btn').addEventListener('click', () => {
      displayOrgRepos(org.name);
    });
    
    orgsList.appendChild(card);
  }
}

function initBrowserTabs() {
  const tabButtons = document.querySelectorAll('.browser-tab');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Hide all views
      const views = document.querySelectorAll('.browser-view');
      views.forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
      });

      // Add active class to clicked button and corresponding view
      button.classList.add('active');
      const viewId = `${button.getAttribute('data-view')}-view`;
      const activeView = document.getElementById(viewId);
      if (activeView) {
        activeView.classList.add('active');
        activeView.style.display = 'flex';
      }
    });
  });
}

// GitHub user search functionality
async function searchGitHubUsers(query) {
  try {
    const response = await fetch(`https://api.github.com/search/users?q=${query}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    return { items: [] };
  }
}

async function fetchUserProfile(username) {
  try {
    const [userResponse, reposResponse, orgsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`),
      fetch(`https://api.github.com/users/${username}/orgs`)
    ]);

    if (!userResponse.ok) throw new Error('Failed to fetch user profile');
    
    const userData = await userResponse.json();
    const repos = await reposResponse.json();
    const orgs = await orgsResponse.json();

    return { userData, repos, orgs };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Keep track of current user's repos and orgs for search
let currentUserRepos = [];
let currentUserOrgs = [];

function createUserProfileTab(userData) {
  const tabsContainer = document.getElementById('browser-tabs');
  const container = document.getElementById('container');
  
  // Create new tab
  const tab = document.createElement('button');
  tab.className = 'browser-tab';
  tab.setAttribute('data-view', `user-${userData.login}`);
  tab.innerHTML = `
    <img src="${userData.avatar_url}" alt="${userData.login}" style="width: 16px; height: 16px; border-radius: 50%;">
    <span>${userData.login}</span>
    <button class="close-btn" title="Close tab">×</button>
  `;

  // Create new view
  const view = document.createElement('div');
  view.id = `user-${userData.login}-view`;
  view.className = 'browser-view';
  view.innerHTML = `
    <main class="main-content">
      <div class="user-header">
        <img src="${userData.avatar_url}" alt="${userData.login}" class="user-avatar">
        <div class="user-info">
          <h2>${userData.name || userData.login}</h2>
          <p>${userData.bio || ''}</p>
          <div class="user-stats">
            <div class="stat">
              <span class="stat-value">${userData.public_repos}</span>
              <span class="stat-label">Repositories</span>
            </div>
            <div class="stat">
              <span class="stat-value">${userData.followers}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-value">${userData.following}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="repos">Repositories</button>
        <button class="tab" data-tab="orgs">Organizations</button>
      </div>
      <div id="user-${userData.login}-repos" class="tab-content active card-container"></div>
      <div id="user-${userData.login}-orgs" class="tab-content card-container"></div>
    </main>
  `;

  // Add tab and view to DOM
  tabsContainer.appendChild(tab);
  container.appendChild(view);

  // Add tab switching functionality
  tab.addEventListener('click', () => {
    document.querySelectorAll('.browser-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.browser-view').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    tab.classList.add('active');
    view.classList.add('active');
    view.style.display = 'flex';
  });

  // Add close button functionality
  tab.querySelector('.close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    view.remove();
    tab.remove();
    
    // Switch to user search view if no other user tabs are open
    const remainingUserTabs = document.querySelectorAll('.browser-tab[data-view^="user-"]');
    if (remainingUserTabs.length === 0) {
      document.querySelector('.browser-tab[data-view="user-search"]').click();
    } else {
      remainingUserTabs[remainingUserTabs.length - 1].click();
    }
  });

  // Add tab functionality for repos/orgs
  view.querySelectorAll('.tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      view.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      view.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tabBtn.classList.add('active');
      const contentId = `user-${userData.login}-${tabBtn.dataset.tab}`;
      document.getElementById(contentId).classList.add('active');
    });
  });

  return { tab, view };
}

function displayUserProfile(userData, repos, orgs) {
  // Store repos and orgs for search functionality
  currentUserRepos = repos;
  currentUserOrgs = orgs;

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
  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description || 'No description provided.'}</p>
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    `;
    userRepos.appendChild(card);
  });

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

  // Activate the new tab
  tab.click();
}

function initUserSearch() {
  const searchInput = document.getElementById('github-user-search');
  const searchResults = document.getElementById('search-results');
  const userProfile = document.getElementById('user-profile');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    // Show search results and hide profile
    searchResults.style.display = 'grid';
    // userProfile.style.display = 'none';

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

  // Tab switching functionality
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      tab.classList.add('active');
      const tabContent = document.getElementById(`user-${tab.dataset.tab}`);
      if (tabContent) tabContent.classList.add('active');
    });
  });
}

function initSearch() {
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
      switch (activeTab.dataset.view) {
        case 'personal':
          if (!currentSelectedLanguage) return;
          const languageRepos = allRepos.filter(repo => (repo.language || 'Unknown') === currentSelectedLanguage);
          searchRepos(query, languageRepos, projectsList);
          break;
        
        case 'organizations':
          // If viewing an organization's repos
          const orgView = activeView.querySelector('.card-container');
          if (orgView) {
            const orgRepos = Array.from(orgView.querySelectorAll('.card')).map(card => ({
              name: card.querySelector('h3').textContent,
              description: card.querySelector('p').textContent,
              html_url: card.querySelector('a').href
            }));
            searchRepos(query, orgRepos, orgView);
          }
          break;
        
        case 'user-search':
          // If viewing a user's profile
          if (document.getElementById('user-profile').style.display === 'block') {
            const activeProfileTab = document.querySelector('.tabs .tab.active');
            if (activeProfileTab) {
              if (activeProfileTab.dataset.tab === 'repos') {
                searchRepos(query, currentUserRepos, document.getElementById('user-repos'));
              } else if (activeProfileTab.dataset.tab === 'orgs') {
                searchRepos(query, currentUserOrgs, document.getElementById('user-orgs'));
              }
            }
          }
          break;
      }
    }, 300); // 300ms debounce delay
  });
}

function init() {
  fetchUserRepos();
  displayOrgs();
  initBrowserTabs();
  initUserSearch();
  initSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  const themeButtons = document.querySelectorAll('.theme-btn');

  function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('dark-theme', 'light-theme');
      document.body.style.removeProperty('--primary-color');
      document.body.style.removeProperty('--secondary-color');
      document.body.style.removeProperty('--tertiary-color');
      document.body.style.removeProperty('--background-gradient-start');
      document.body.style.removeProperty('--background-gradient-end');
      document.body.style.removeProperty('--text-color');
      document.body.style.removeProperty('--card-background');
      document.body.style.removeProperty('--card-hover-shadow');
      document.body.style.removeProperty('--link-color');
      document.body.style.removeProperty('--link-hover-color');
    }
  }

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      themeButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      applyTheme(button.getAttribute('data-theme'));
    });
  });

  // Apply default theme on load
  const defaultButton = document.querySelector('.theme-btn.selected');
  if (defaultButton) {
    applyTheme(defaultButton.getAttribute('data-theme'));
  }
});
