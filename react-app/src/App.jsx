import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import RepoList from './components/RepoList.jsx';
import OrgList from './components/OrgList.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { fetchUserRepos, fetchGitHubAPI } from './api/github.js';
import { groupReposByLanguage } from './utils/group.js';

const USERNAME = 'JayNightmare';
const ORGS = [
  { name: 'Nexus-Scripture', url: 'https://github.com/Nexus-Scripture' },
  { name: 'Augmented-Perception', url: 'https://github.com/Augmented-Perception' },
];

export default function App() {
  const [repos, setRepos] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function loadData() {
      try {
        const userRepos = await fetchUserRepos(USERNAME);
        setRepos(userRepos);
        const loadedOrgs = [];
        for (const org of ORGS) {
          try {
            const data = await fetchGitHubAPI(`/orgs/${org.name}`);
            loadedOrgs.push(data);
          } catch {}
        }
        setOrgs(loadedOrgs);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const grouped = groupReposByLanguage(repos);

  return (
    <Container className="py-4">
      <h1 className="mb-4">GitHub Portfolio Viewer</h1>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <Tabs defaultActiveKey="repos" className="mb-3">
        <Tab eventKey="repos" title="Repositories">
          {Object.keys(grouped).map((lang) => (
            <div key={lang} className="mb-4">
              <h3>{lang}</h3>
              <RepoList repos={grouped[lang]} />
            </div>
          ))}
        </Tab>
        <Tab eventKey="orgs" title="Organizations">
          <OrgList orgs={orgs} />
        </Tab>
      </Tabs>
    </Container>
  );
}
