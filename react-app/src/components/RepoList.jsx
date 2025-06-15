import { useState } from 'react';
import RepoCard from './RepoCard.jsx';
import Form from 'react-bootstrap/Form';

export default function RepoList({ repos }) {
  const [search, setSearch] = useState('');
  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <Form.Control
        type="search"
        placeholder="Search repositories..."
        className="mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
      {filtered.length === 0 && <p>No repositories found.</p>}
    </div>
  );
}
