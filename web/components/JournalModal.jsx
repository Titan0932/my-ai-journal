// @ts-nocheck comment at the top of a file
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Markdown from 'react-markdown';

const JournalModal = ({ show, onHide, entry, isSummarizing }) => {
  const EmotionLabel = ({ label, score }) => {
    const getEmotionColor = (emotion) => {
      const colors = {
        joy: 'bg-yellow-100 text-yellow-800',
        sadness: 'bg-blue-100 text-blue-800',
        anger: 'bg-red-100 text-red-800',
        fear: 'bg-purple-100 text-purple-800',
        disgust: 'bg-green-100 text-green-800',
        surprise: 'bg-orange-100 text-orange-800',
        neutral: 'bg-gray-100 text-gray-800'
      };
      return colors[emotion] || 'bg-gray-100 text-gray-800';
    };

    if (score < 0.01) return null;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mr-1 ${getEmotionColor(label)}`}>
        <span className="capitalize">{label}</span>
        <span className="ml-1 opacity-75">
          {(score * 100).toFixed(0)}%
        </span>
      </span>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <div className="bg-white rounded-lg shadow-lg">
        <Modal.Header className="border-b border-gray-200 p-4">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Modal.Title className="text-xl font-semibold text-gray-900">
                {entry.title}
              </Modal.Title>
              <span className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry?.moodscores && entry.moodscores[0]?.map(({ label, score }) => (
                <EmotionLabel key={label} label={label} score={score} />
              ))}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-6">
          {isSummarizing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="text-blue-500" animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-4 text-gray-600">Generating summary...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Summary
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <Markdown>{entry.summary}</Markdown>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Journal Entry
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 p-4">
          <Button 
            variant="secondary" 
            onClick={onHide}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Close
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default JournalModal;