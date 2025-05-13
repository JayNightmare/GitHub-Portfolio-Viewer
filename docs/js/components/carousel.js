// Store pinned repositories in localStorage
let pinnedRepos = JSON.parse(localStorage.getItem('pinnedRepos') || '[]');

// Helper function to render repository cards
const renderRepoCard = (repo, container, showPinButton = true) => {
  const isPinned = pinnedRepos.includes(repo.name);
  const card = document.createElement('div');
  card.className = `card ${isPinned ? 'pinned' : ''}`;
  
  // Get repository topics and languages for tech tags
  const techTags = [repo.language].filter(Boolean);
  if (repo.topics) techTags.push(...repo.topics);
  
  card.innerHTML = `
    ${showPinButton ? `
      <button class="pin-btn ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Unpin' : 'Pin'} repository">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
        </svg>
      </button>
    ` : ''}
    <div>
      <h3>${repo.name}</h3>
      <p>${repo.description || 'No description provided.'}</p>
      <div class="tech-tags">
        ${techTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
      </div>
      <div class="repo-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
      </div>
    </div>
  `;

  // Add pin button functionality
  if (showPinButton) {
    const pinBtn = card.querySelector('.pin-btn');
    pinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isPinned) {
        pinnedRepos = pinnedRepos.filter(name => name !== repo.name);
        pinBtn.classList.remove('pinned');
        pinBtn.title = 'Pin repository';
      } else {
        pinnedRepos.push(repo.name);
        pinBtn.classList.add('pinned');
        pinBtn.title = 'Unpin repository';
      }
      
      localStorage.setItem('pinnedRepos', JSON.stringify(pinnedRepos));
      updateFeaturedProjects(); // Refresh featured projects carousel
    });
  }

  container.appendChild(card);
};

// Function to update featured projects carousel
export const updateFeaturedProjects = (allRepos) => {
  const carouselTrack = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  
  if (!carouselTrack || !allRepos) return;

  carouselTrack.innerHTML = '';
  
  // Filter pinned repositories
  const featuredRepos = allRepos.filter(repo => pinnedRepos.includes(repo.name));
  
  // If no pinned repos, show a message
  if (featuredRepos.length === 0) {
    carouselTrack.innerHTML = `
      <div class="empty-state">
        <p>No pinned repositories found</p>
        <p class="suggestion">Pin your favorite repositories to see them here!</p>
      </div>
    `;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // Update navigation buttons state
  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = featuredRepos.length <= 3;

  featuredRepos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'featured-card';
    
    // Try to get a screenshot from the repo
    const screenshotUrl = `./images/projects/${repo.name}.png`;
    
    card.innerHTML = `
      <img src="${screenshotUrl}" alt="${repo.name}" onerror="this.src='./images/preview.png'">
      <div class="featured-card-content">
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description provided.'}</p>
        <div class="tech-tags">
          ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
          ${repo.topics ? repo.topics.map(topic => `<span class="tech-tag">${topic}</span>`).join('') : ''}
        </div>
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
      </div>
    `;
    
    carouselTrack.appendChild(card);
  });
};

// Carousel navigation
export const initCarousel = () => {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  
  if (!track || !prevBtn || !nextBtn) return;

  const scrollAmount = 320; // card width + gap

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
};

export { renderRepoCard, pinnedRepos };
