// @ts-nocheck comment at the top of a file
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {JournalForm} from "../components/JournalForm"
import { useAction } from "@gadgetinc/react";
import { api } from '../api';
import { useUser } from "@gadgetinc/react";

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


const MUTABLE_FIELDS = [
  "title",
  "content",
  "date",
  "summary",
  "keywords",
  "moodscores"
]

const MyJournal = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [{ data:createData, error:createError, fetching:fetchingCreate }, create] = useAction(api.journalData.create);
  const [{ data:deleteData, error:deleteError, fetching:fetchingDelete }, _delete] = useAction(api.journalData.delete);
  const [{ data:updateData, error:updateError, fetching:fetchingUpdate }, update] = useAction(api.journalData.update);

  const user  = useUser(api);

  const getJournalData = async (filters) => {
    let getData = await api.journalData.findMany({
      filter: {
        ...filters, 
        user: {
          id:{
            equals: user.id
          }
        }
      },
      sort: { date: "Descending" }
    });
    return getData
  }


  useEffect( () => {
    getJournalData({}).then( 
      (data ) => {
        setEntries(JSON.parse(JSON.stringify(data)))
      }
    )
  },[createData, deleteData, updateData])
  
  const handleSubmit = async (entry) => {
    // console.log("crated: ", entry)
    if (editingEntry) {

      let editableObj = {id: entry.id}  // to identify the record
      for(let key of Object.keys(entry)){
        if(MUTABLE_FIELDS.includes(key)){
          editableObj[key] = entry[key]
        }
      }


      await update({
        ...editableObj
      })
      setEntries(entries.map(e => 
        e.id === editingEntry.id ? { ...entry, id: e.id } : e
      ));
      setEditingEntry(null);
    } else {
      await create({
        journalData: 
          {...entry}
        
      });
      setEntries([
        ...entries,
        { ...entry, id: createData.id}
      ]);

    }
  };

  // console.log("entries: ", entries)
  // console.log("editingEntry: ", editingEntry)

  const handleEdit = (entry) => {
    setEditingEntry({...entry, date: new Date(entry.date).toISOString().split('T')[0]});
  };

  const handleDelete = async (id) => {
    await _delete({
        id: id
      }
    )
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    
    <div className="container py-4">
      {fetchingCreate || fetchingDelete || fetchingUpdate ?
        <>
          Loading............
        </>
        :
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
      }
      {
        createError || deleteError || updateError ?
          <>
            Error: {JSON.stringify((`${createError || deleteError || updateError}`))}
          </>
          :
          <></>
        
      }
    </div>
  );
};

export default MyJournal;