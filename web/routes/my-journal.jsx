// @ts-nocheck comment at the top of a file
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {JournalForm} from "../components/JournalForm"
import { useAction } from "@gadgetinc/react";
import { api } from '../api';
import { useUser } from "@gadgetinc/react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { useGlobalAction } from '@gadgetinc/react';
import Markdown from 'react-markdown';
import EmotionLabels from '../components/EmotionLabels';
import JournalCard from '../components/JournalCard';
import JournalModal from '../components/JournalModal';

const JournalList = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">
          No journal entries yet
        </div>
      ) : (
        entries.map(entry => (
          <div key={entry.id} className="flex">
            <JournalEntry
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))
      )}
    </div>
  );
};

const JournalEntry = ({ entry, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [{ data, error, fetching }, getSummary] = useGlobalAction(api.getSummary);


  const generateSummary = async (entry) => {
    setIsSummarizing(true);
    try {
      // Replace with your GROQ API call
      const response = await getSummary({content: entry.content});

      const data = await response;
      let newResult = {...entry, summary: data.data}
      onEdit(newResult, true);
      
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSummaryClick = () => {
    setShowModal(true);
    if (!entry.summary) {
      generateSummary(entry);
    }
  };

  return (
    <>
      <div className="w-full"> {/* Add this wrapper */}
        <JournalCard
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
          onSummaryClick={handleSummaryClick}
        />
      </div>
      
      {/* Summary Modal */}
      <JournalModal
        show={showModal}
        onHide={() => setShowModal(false)}
        entry={entry}
        isSummarizing={isSummarizing}
      />
    </>
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
  const [{ data:analyzeData, error:analyzeError, fetching:fetchingAnalyze }, emotionAnalyzer] = useGlobalAction(api.emotionAnalyzer);

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
  
  const sendEditAction = async (entry) => {
    let editableObj = {id: entry.id}  // to identify the record
      for(let key of Object.keys(entry)){
        if(MUTABLE_FIELDS.includes(key)){
          editableObj[key] = entry[key]
        }
      }


      await update({
        ...editableObj
      })
      if (!updateError)
        setEntries(entries.map(e => 
          e.id === entry.id ? { ...entry, id: e.id } : e
        ));

      setEditingEntry(null);
  }

  const sendAddAction = async (entry) => {
    await create({
      journalData: 
        {...entry}
      
    });
    if (!createError)
      setEntries([
        ...entries,
        { ...entry}
      ]);
  }


  const handleSubmit = async (entry, cancelEdit) => {
    if (editingEntry) {
      if(cancelEdit){
        setEditingEntry(null)
      }else
        await sendEditAction(entry)
    } else {
      let emotionResult = await emotionAnalyzer({content: entry.content})
      let newEntryWithEmotion = {...entry, moodscores: emotionResult.data}
      await sendAddAction(newEntryWithEmotion)
    }
  };

  // console.log("entries: ", entries)
  // console.log("editingEntry: ", editingEntry)

  const handleEdit = async (entry, submit = false) => {
    submit ? 
      await sendEditAction(entry)
    :
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
      {fetchingCreate || fetchingDelete || fetchingUpdate &&
        <>
          Loading............
        </>
      }
      <div className="row justify-center">
        <div className="col-12 col-md-8 col-lg-12">
          <h1 className="text-center mb-4">My Journal</h1>
          <JournalForm 
            onSubmit={handleSubmit}
            initialEntry={editingEntry}
          />
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">My Journal</h1>
            <div className="max-w-7xl mx-auto">
              <JournalList
                entries={entries}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
          </div>
      </div>
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