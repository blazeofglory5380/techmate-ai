function KnowledgeCard({ item }) {
  return (
    <article className="kb-card">
      <div>
        <span>{item.category}</span>
        <h3>{item.title}</h3>
      </div>
      <p>{item.description}</p>
      <small>{item.location}</small>
    </article>
  );
}

export default KnowledgeCard;
