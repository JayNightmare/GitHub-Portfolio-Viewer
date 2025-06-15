import { renderRepoCard } from './carousel.js';
import { fetchOrgRepos, fetchUserProfile } from '../api/github.js';
import { showProjectDetails } from './modal.js';
import { groupReposByLanguage } from '../utils/group.js';

// SVG icons for folder states
const FOLDER_ICONS = {
  closed: `<svg class="folder-svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4H4Z"/>
  </svg>`,
  open: `<svg class="folder-svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M2 6C2 4.89543 2.89543 4 4 4H10L12 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6V18H20V8H11.1716L9.17157 6H4Z"/>
  </svg>`
};


function highlightSelectedFolder(li, folderList) {
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
function renderReposForLanguage(language, allRepos, projectsList) {
  projectsList.innerHTML = '';
  if (!language) return;
  
  // Filter repos by selected language
  const repos = allRepos.filter(repo => (repo.language || 'Unknown') === language);
  repos.forEach(repo => renderRepoCard(repo, projectsList));
}

// Render folder list in sidebar
export function renderFolderList(languages, folderList, currentSelectedLanguage, allRepos, projectsList) {
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
      highlightSelectedFolder(li, folderList);
      renderReposForLanguage(language, allRepos, projectsList);
    });

    folderList.appendChild(li);
  });
}

export function createOrgTab(orgName) {
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

export async function displayOrgRepos(orgName) {
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
    icon.innerHTML = FOLDER_ICONS.closed;
    li.prepend(icon);

    li.addEventListener('click', () => {
      // Update selected state
      highlightSelectedFolder(li, folderList);

      // Render repos for selected language
      const reposContainer = view.querySelector('.card-container');
      reposContainer.innerHTML = '';
      
      groupedRepos[language].forEach(repo => renderRepoCard(repo, reposContainer));
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

  initTabSwitching();
}

export function createUserProfileTab(userData) {
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

  return { tab, view };
}

export function initTabSwitching() {
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
