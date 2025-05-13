import { fetchUserRepos, setupCacheClearing } from './api/github.js';
import { updateFeaturedProjects, initCarousel } from './components/carousel.js';
import { renderFolderList, initTabSwitching, displayOrgRepos } from './components/tabs.js';
import { initUserSearch, initRepoSearch } from './utils/search.js';
import { initThemeManager } from './utils/theme.js';
import { createProjectModal, showProjectDetails } from './components/modal.js';
import cache from './state/cache.js';

// Configuration
const username = 'JayNightmare';
const orgs = [
  { name: 'Nexus-Scripture', url: 'https://github.com/Nexus-Scripture' },
  { name: 'Augmented-Perception', url: 'https://github.com/Augmented-Perception' },
];

// Global state
let currentSelectedLanguage = null;
let allRepos = [];

// Display organizations
async function displayOrgs() {
  const orgsList = document.getElementById('orgs-list');
  orgsList.innerHTML = '';
  
  for (const org of orgs) {
    // Try to get cached org data first
    let avatarUrl = '';
    const cacheKey = `/orgs/${org.name}`;
    const cachedOrgData = cache.get(cacheKey);

    if (cachedOrgData) {
      avatarUrl = cachedOrgData.avatar_url;
    } else {
      try {
        const response = await fetch(`https://api.github.com/orgs/${org.name}`);
        if (response.ok) {
          const orgData = await response.json();
          avatarUrl = orgData.avatar_url;
          cache.set(cacheKey, orgData);
        }
      } catch (e) {
        console.error('Error fetching org data:', e);
      }
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

// Initialize repositories
async function initRepos() {
  const projectsList = document.getElementById('projects-list');
  const folderList = document.getElementById('folder-list');

  projectsList.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading repositories...</p>
    </div>
  `;

  try {
    const repos = await fetchUserRepos(username);

    if (repos.length === 0) {
      projectsList.innerHTML = `
        <div class="empty-state">
          <p>No repositories found</p>
          <p class="suggestion">Create your first repository to get started!</p>
        </div>
      `;
      return;
    }

    // Store all repos for search functionality
    allRepos = repos;

    // Update featured projects first
    updateFeaturedProjects(allRepos);

    // Group repos by language and render folder list
    const groupedRepos = groupReposByLanguage(repos);
    const languages = Object.keys(groupedRepos).sort();

    renderFolderList(languages, folderList, currentSelectedLanguage, allRepos, projectsList);

    // Select first language by default
    if (languages.length > 0) {
      const firstLangFolder = folderList.querySelector('li');
      if (firstLangFolder) {
        firstLangFolder.click();
      }
    }

    // Add click handlers for project details
    const addProjectClickHandlers = () => {
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('pin-btn') || e.target.closest('.pin-btn')) return;
          const repoName = card.querySelector('h3').textContent;
          const repo = allRepos.find(r => r.name === repoName);
          if (repo) showProjectDetails(repo, username);
        });
      });
    };

    // Initial setup of click handlers
    addProjectClickHandlers();

    // Re-add click handlers after search or filter
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          addProjectClickHandlers();
        }
      });
    });

    observer.observe(projectsList, { childList: true });
  } catch (error) {
    projectsList.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
  }
}

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

// Initialize the application
function init() {
  // Initialize marked options for README rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false
  });

  // Setup cache clearing mechanism
  setupCacheClearing();

  // Create project modal
  createProjectModal();

  // Initialize all features
  initRepos();
  displayOrgs();
  initTabSwitching();
  initUserSearch();
  initRepoSearch();
  initCarousel();
  initThemeManager();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
