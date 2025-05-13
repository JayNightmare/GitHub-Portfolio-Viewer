import { fetchGitHubAPI } from '../api/github.js';

export const createProjectModal = () => {
  // Remove existing modal if it exists
  const existingModal = document.getElementById('project-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'project-modal';
  modal.className = 'project-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-body">
        <!-- Content will be dynamically inserted here -->
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close');
  const closeModal = () => {
    modal.classList.add('fade-out');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out');
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Add keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });

  return modal;
};

const renderModalContent = (repo, readmeContent, recentCommits, openIssues) => {
  return `
    <div class="modal-header">
      <h2>${repo.name}</h2>
      <div class="repo-stats">
        <span title="Stars">⭐ ${repo.stargazers_count}</span>
        <span title="Forks">🔄 ${repo.forks_count}</span>
        <span title="Watchers">👀 ${repo.watchers_count}</span>
      </div>
    </div>
    <div class="repo-details">
      <p>${repo.description || 'No description provided.'}</p>
      <div class="repo-meta">
        <span>Language: ${repo.language || 'Not specified'}</span>
        <span>Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
        <span>Created: ${new Date(repo.created_at).toLocaleDateString()}</span>
      </div>
      <div class="repo-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
          View on GitHub
        </a>
        ${repo.homepage ? `
          <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="repo-link">
            Visit Homepage
          </a>
        ` : ''}
      </div>
    </div>
    ${readmeContent ? `
      <div class="readme-section">
        <h3>README</h3>
        <div class="readme-content">${marked.parse(readmeContent)}</div>
      </div>
    ` : ''}
    ${recentCommits.length ? `
      <div class="commits-section">
        <h3>Recent Commits</h3>
        <ul class="commits-list">
          ${recentCommits.map(commit => `
            <li>
              <strong>${commit.commit.message.split('\n')[0]}</strong>
              <div class="commit-meta">
                <span>by ${commit.commit.author.name}</span>
                <span>${new Date(commit.commit.author.date).toLocaleDateString()}</span>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
    ${openIssues.length ? `
      <div class="issues-section">
        <h3>Open Issues (${openIssues.length})</h3>
        <ul class="issues-list">
          ${openIssues.slice(0, 5).map(issue => `
            <li>
              <a href="${issue.html_url}" target="_blank" rel="noopener noreferrer">
                ${issue.title}
              </a>
              <div class="issue-meta">
                <span>#${issue.number}</span>
                <span>opened ${new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
            </li>
          `).join('')}
        </ul>
        ${openIssues.length > 5 ? `
          <a href="${repo.html_url}/issues" target="_blank" rel="noopener noreferrer" class="view-all-link">
            View all ${openIssues.length} issues
          </a>
        ` : ''}
      </div>
    ` : ''}
  `;
};

export const showProjectDetails = async (repo, username) => {
  const modal = document.getElementById('project-modal') || createProjectModal();
  const modalBody = modal.querySelector('.modal-body');

  // Show loading state with progress indicators
  modalBody.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading project details...</p>
      <div class="loading-progress">
        <div>Fetching README...</div>
        <div>Loading commit history...</div>
        <div>Checking issues...</div>
      </div>
    </div>
  `;
  modal.style.display = 'block';

  try {
    // Fetch all data in parallel with error handling for each request
    const [readme, commits, issues] = await Promise.allSettled([
      fetchGitHubAPI(`/repos/${username}/${repo.name}/readme`)
        .then(data => atob(data.content))
        .catch(() => ''),
      fetchGitHubAPI(`/repos/${username}/${repo.name}/commits?per_page=5`)
        .catch(() => []),
      fetchGitHubAPI(`/repos/${username}/${repo.name}/issues?state=open`)
        .catch(() => [])
    ]);

    // Process results
    const readmeContent = readme.status === 'fulfilled' ? readme.value : '';
    const recentCommits = commits.status === 'fulfilled' ? commits.value : [];
    const openIssues = issues.status === 'fulfilled' ? issues.value : [];

    // Use the renderModalContent function to generate the HTML
    modalBody.innerHTML = renderModalContent(repo, readmeContent, recentCommits, openIssues);
  } catch (error) {
    modalBody.innerHTML = `<p>Error loading project details: ${error.message}</p>`;
  }
};
