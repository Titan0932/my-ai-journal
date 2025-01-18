import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {JournalForm} from "../components/JournalForm"

const JournalList = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="journal-list">
      {entries.length === 0 ? (
        <p className="text-center text-muted">No journal entries yet</p>
      ) : (
        entries.map(entry => (
          <JournalEntry
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

const JournalEntry = ({ entry, onEdit, onDelete }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title">{entry.title}</h5>
          <small className="text-muted">{new Date(entry.date).toLocaleDateString()}</small>
        </div>
        <p className="card-text">{entry.content}</p>
        <div className="d-flex justify-content-end">
          <button 
            className="btn btn-outline-primary btn-sm me-2" 
            onClick={() => onEdit(entry)}
          >
            Edit
          </button>
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};




const MyJournal = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);

  const handleSubmit = (entry) => {
    if (editingEntry) {
      setEntries(entries.map(e => 
        e.id === editingEntry.id ? { ...entry, id: e.id } : e
      ));
      setEditingEntry(null);
    } else {
      setEntries([
        ...entries,
        { ...entry, id: Date.now() }
      ]);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center mb-4">My Journal</h1>
          <JournalForm 
            onSubmit={handleSubmit}
            initialEntry={editingEntry}
          />
          <JournalList
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default MyJournal;