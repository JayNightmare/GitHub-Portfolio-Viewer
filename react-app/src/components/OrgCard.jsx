import Card from 'react-bootstrap/Card';

export default function OrgCard({ org }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <img src={org.avatar_url} alt={org.login} width="50" height="50" className="me-3 rounded" />
        <div>
          <Card.Title>{org.login}</Card.Title>
          <Card.Link href={org.html_url} target="_blank" rel="noreferrer">
            View Organization
          </Card.Link>
        </div>
      </Card.Body>
    </Card>
  );
}
