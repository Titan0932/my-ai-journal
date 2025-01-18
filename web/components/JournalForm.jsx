import React, { useState, useEffect } from 'react';

export const JournalForm = ({ onSubmit, initialEntry = null }) => {
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialEntry) {
      setEntry(initialEntry);
    }
  }, [initialEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(entry);
    setEntry({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          id="title"
          value={entry.title}
          onChange={(e) => setEntry({ ...entry, title: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="content" className="form-label">Content</label>
        <textarea
          className="form-control"
          id="content"
          rows="4"
          value={entry.content}
          onChange={(e) => setEntry({ ...entry, content: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="date" className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          id="date"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {initialEntry ? 'Update Entry' : 'Add Entry'}
      </button>
    </form>
  );
};
