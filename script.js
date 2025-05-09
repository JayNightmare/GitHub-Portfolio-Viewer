const username = 'JayNightmare';
const orgs = [
  { name: 'Nexus-Scripture', url: 'https://github.com/Nexus-Scripture' },
  { name: 'Augmented Perception', url: 'https://github.com/Augmented-Perception' },
];

const folderList = document.getElementById('folder-list');
const projectsList = document.getElementById('projects-list');
const orgsList = document.getElementById('orgs-list');

let currentSelectedLanguage = null;
let allRepos = [];

// Search functionality
const searchRepos = (query) => {
  const searchTerm = query.toLowerCase();
  
  if (!searchTerm) {
    // If search is empty, show repos for current selected language
    renderReposForLanguage(currentSelectedLanguage);
    return;
  }

  // Search through all repos
  const filteredRepos = allRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm))
  );

  // Clear current display
  projectsList.innerHTML = '';

  // Show filtered results
  filteredRepos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description ? repo.description : 'No description provided.'}</p>
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    `;
    projectsList.appendChild(card);
  });
};

// Add search event listener
document.getElementById('repo-search').addEventListener('input', (e) => {
  searchRepos(e.target.value);
});

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

function highlightSelectedFolder(li) {
  if (!li) return;
  folderList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
  li.classList.add('selected');
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
    icon.textContent = '📁';
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
      folderList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
      li.classList.add('selected');

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

function displayOrgs() {
  orgsList.innerHTML = '';
  orgs.forEach(org => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${org.name}</h3>
      <button class="view-org-btn">View Organization Repos</button>
    `;
    
    // Add click handler for the button
    card.querySelector('.view-org-btn').addEventListener('click', () => {
      displayOrgRepos(org.name);
    });
    
    orgsList.appendChild(card);
  });
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

function init() {
  fetchUserRepos();
  displayOrgs();
  initBrowserTabs();
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  const themeButtons = document.querySelectorAll('.theme-btn');

  function applyTheme(theme) {
    document.body.classList.remove('pink-theme', 'dark-theme', 'light-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('pink-theme', 'dark-theme', 'light-theme');
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
