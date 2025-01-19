// @ts-nocheck comment at the top of a file
import React, { useState, useEffect, useRef } from 'react';
import { useUser, useGlobalAction } from "@gadgetinc/react";
import { api } from '../api';
import ImageEmotionAnalysis from './ImageEmotionAnalysis';

export const JournalForm = ({ onSubmit, initialEntry = null, setEditingEntry }) => {
  const user = useUser(api);
  const [isRecording, setIsRecording] = useState(false);
  const [{ data:speechData, error: speechError, fetching:fetchingSpeech }, speechToText] = useGlobalAction(api.speechToText);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [translateMode, setTranslateMode] = useState(false)


  const defaultEntry = {
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    summary: "",
    keywords: {},
    moodscores: {},
  }
  const [entry, setEntry] = useState(defaultEntry);

  useEffect(() => {
    if (initialEntry) {
      setEntry(initialEntry);
    }
  }, [initialEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(entry);
    setEntry(defaultEntry);
    setEditingEntry(null)
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Clear previous chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
      setLoading(true);
      try {
        // Convert the audio blob to a base64 string
        const base64Audio = await blobToBase64(audioBlob);
    
        // Send the base64 string to your backend
        let response;
        response = await speechToText({ audioData: base64Audio, translateMode: translateMode });
        setEntry({...entry, content: entry.content + " " + response?.data?.text})
      } catch (error) {
        console.error('Transcription error:', error);
      } finally {
        setLoading(false);
      }
    };
      

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access the microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleImageAnalysis = (analysis, base64Image, fullBase64Image) => {
    // Assuming the analysis returns a text description
    setEntry(prev => ({
      ...prev,
      content: '\n\nImage Analysis:\n' + analysis,
      // You might also want to store the image and analysis separately
      image: fullBase64Image
    }));
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
        <label htmlFor="content" className="form-label d-flex justify-content-between align-items-center">
          Content
          <button
            type="button"
            className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading || fetchingSpeech}
          >
            {isRecording ? (
              <>
                <i className="bi bi-mic-fill me-1"></i>
                Stop Recording
              </>
            ) : (
              <>
                <i className="bi bi-mic me-1"></i>
                Start Recording
              </>
            )}
          </button>
          {
            <span
              className={`btn btn-sm ${translateMode ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => {setTranslateMode(!translateMode)}}
            >{translateMode? "Translation On" : "Translation Off"}</span>
          }
        </label>
        <textarea
          className="form-control mb-3"
          id="content"
          rows="7"
          value={entry.content}
          onChange={(e) => setEntry({ ...entry, content: e.target.value })}
          required
        />
        <ImageEmotionAnalysis onImageAnalysis={handleImageAnalysis} />
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
      </div>

      {loading && <p className="text-muted">Transcribing audio...</p>}

      <button type="submit" className="btn btn-primary">
        {initialEntry ? 'Update Entry' : 'Add Entry'}
      </button>
      {initialEntry && 
        <button className="btn btn-error" onClick={(e) => handleSubmit(null, true)}>
          Cancel
        </button>
      }
    </form>
  );
};