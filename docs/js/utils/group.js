export function groupReposByLanguage(repos) {
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
