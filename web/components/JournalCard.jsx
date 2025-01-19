// @ts-nocheck comment at the top of a file
import React from 'react';

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

const JournalCard = ({ entry, onEdit, onDelete, onSummaryClick }) => {

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="p-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <h5 className="text-lg font-semibold text-gray-600">{entry.title}</h5>
            <small className="text-sm text-gray-900 whitespace-nowrap ml-4">
              {new Date(entry.date).toLocaleDateString()}
            </small>
          </div>
          
          {/* Emotions Section */}
          {entry.moodscores && (
            <div className="flex flex-wrap gap-1">
              {[...entry.moodscores[0]]
                .sort((a, b) => b.score - a.score)
                .map(({ label, score }) => (
                  <EmotionLabel key={label} label={label} score={score} />
                ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <p className="mt-3 text-gray-600">
          {truncateText(entry.content)}
        </p>

        {/* Actions Section */}
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            onClick={onSummaryClick}
          >
            {entry.summary ? 'View Summary' : 'Generate Summary'}
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(entry)}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(entry.id)}
              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;