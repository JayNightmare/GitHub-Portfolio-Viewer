import OrgCard from './OrgCard.jsx';

export default function OrgList({ orgs }) {
  if (orgs.length === 0) {
    return <p>No organizations found.</p>;
  }
  return (
    <div>
      {orgs.map((org) => (
        <OrgCard key={org.id} org={org} />
      ))}
    </div>
  );
}
