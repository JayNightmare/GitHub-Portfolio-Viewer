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
      updateSelectedFolder();
      renderReposForLanguage(language);
    });

    folderList.appendChild(li);
  });
}

// Update selected folder highlight
function updateSelectedFolder() {
  const items = folderList.querySelectorAll('li');
  items.forEach(item => {
    if (item.textContent.trim() === currentSelectedLanguage) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
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
      updateSelectedFolder();
      renderReposForLanguage(currentSelectedLanguage);
    }
  } catch (error) {
    projectsList.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
  }
}

function displayOrgs() {
  orgsList.innerHTML = '';
  orgs.forEach(org => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${org.name}</h3>
      <a href="${org.url}" target="_blank" rel="noopener noreferrer">Visit Organization</a>
    `;
    orgsList.appendChild(card);
  });
}

function init() {
  fetchUserRepos();
  displayOrgs();
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  const themeSelector = document.getElementById('theme-selector');

  function applyTheme(theme) {
    document.body.classList.remove('pink-theme', 'dark-theme', 'light-theme');
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach(heading => {
      heading.classList.remove('pink-theme', 'dark-theme', 'light-theme');
    });

    if (theme === 'pink') {
      document.body.classList.add('pink-theme');
      headings.forEach(heading => heading.classList.add('pink-theme'));
    } else if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      headings.forEach(heading => heading.classList.add('dark-theme'));
    } else if (theme === 'light') {
      document.body.classList.add('light-theme');
      headings.forEach(heading => heading.classList.add('light-theme'));
    } else {
      // Default theme: remove inline styles
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

  themeSelector.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  // Apply default theme on load
  applyTheme(themeSelector.value);
});
