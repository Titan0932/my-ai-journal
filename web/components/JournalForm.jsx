// @ts-nocheck comment at the top of a file
import React, { useState, useEffect, useRef } from 'react';
import { useUser, useGlobalAction } from "@gadgetinc/react";
import { api } from '../api';
import { Mic, MicOff, Globe, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ImageEmotionAnalysis from './ImageEmotionAnalysis';

export const JournalForm = ({ onSubmit, initialEntry = null, setEditingEntry }) => {
  const user = useUser(api);
  const [isRecording, setIsRecording] = useState(false);
  const [{ data: speechData, error: speechError, fetching: fetchingSpeech }, speechToText] = useGlobalAction(api.speechToText);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [translateMode, setTranslateMode] = useState(false);

  const defaultEntry = {
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    summary: "",
    keywords: {},
    moodscores: {},
  };
  
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
    <Card className="w-full max-w-3xl mx-auto" style={{background: "#f5cb42", color:"#525151"}}>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          {initialEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={entry.title}
              onChange={(e) => setEntry({ ...entry, title: e.target.value })}
              className="w-full"
              placeholder="Enter your journal title..."
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={translateMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTranslateMode(!translateMode)}
                  className="flex items-center gap-2 text-white"
                >
                  <Globe className="h-4 w-4" />
                  {translateMode ? "Translation On" : "Translation Off"}
                </Button>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || fetchingSpeech}
                  className="flex items-center gap-2  text-white"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </div>
            </div>
            <Textarea
              id="content"
              value={entry.content}
              onChange={(e) => setEntry({ ...entry, content: e.target.value })}
              className="min-h-[200px]"
              placeholder="Write your thoughts here..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Image Analysis</Label>
            <ImageEmotionAnalysis onImageAnalysis={handleImageAnalysis} />
          </div>

          {loading && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Transcribing audio...
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="w-full">
              {initialEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
            {initialEntry && (
              <Button
                // type="button"
                variant="destructive"
                className="w-full"
                onClick={() => handleSubmit(null, true)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};