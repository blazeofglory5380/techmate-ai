function SearchBar({ value, onChange }) {
  return (
    <label className="kb-search">
      <span>Search knowledge base</span>
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search books, topics, playbooks, commands, or errors"
        type="search"
        value={value}
      />
    </label>
  );
}

export default SearchBar;
