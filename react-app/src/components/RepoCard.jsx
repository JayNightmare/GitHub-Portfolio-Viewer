import Card from 'react-bootstrap/Card';

export default function RepoCard({ repo }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{repo.name}</Card.Title>
        <Card.Text>{repo.description}</Card.Text>
        <Card.Text>
          <small className="text-muted">{repo.language || 'Unknown'}</small>
        </Card.Text>
        <Card.Link href={repo.html_url} target="_blank" rel="noreferrer">
          View on GitHub
        </Card.Link>
        {repo.homepage && (
          <Card.Link href={repo.homepage} target="_blank" rel="noreferrer">
            Live Demo
          </Card.Link>
        )}
      </Card.Body>
    </Card>
  );
}
