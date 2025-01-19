// @ts-nocheck comment at the top of a file
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EmotionFilter = ({ entries, onFilterSort }) => {
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  
  // Get unique emotions from all entries
  const allEmotions = Array.from(new Set(
    entries.flatMap(entry => 
      entry.moodscores[0].map(score => score.label)
    )
  ));
  
  const handleEmotionChange = (emotion) => {
    setSelectedEmotion(emotion);
    filterAndSortEntries(emotion, sortDirection);
  };
  
  const handleSortDirectionChange = (direction) => {
    setSortDirection(direction);
    filterAndSortEntries(selectedEmotion, direction);
  };
  
  const filterAndSortEntries = (emotion, direction) => {
    let filteredEntries = [...entries];
    
    // Filter by emotion if not 'all'
    if (emotion !== 'all') {
      filteredEntries = entries.filter(entry => 
        entry.moodscores[0].some(score => 
          score.label === emotion && score.score > 0
        )
      );
    }
    
    // Sort entries by the selected emotion's score
    filteredEntries.sort((a, b) => {
      const scoreA = a.moodscores[0].find(score => score.label === emotion)?.score || 0;
      const scoreB = b.moodscores[0].find(score => score.label === emotion)?.score || 0;
      
      return direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });
    
    onFilterSort(filteredEntries);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label htmlFor="emotion-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Emotion
          </label>
          <select
            id="emotion-filter"
            value={selectedEmotion}
            onChange={(e) => handleEmotionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Emotions</option>
            {allEmotions.map(emotion => (
              <option key={emotion} value={emotion}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEmotion !== 'all' && (
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by Intensity
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortDirectionChange('desc')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  sortDirection === 'desc' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Highest
              </button>
              <button
                onClick={() => handleSortDirectionChange('asc')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  sortDirection === 'asc' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Lowest
              </button>
            </div>
          </div>
        )}
      </div>
      
      {selectedEmotion !== 'all' && (
        <div className="mt-4 text-sm text-gray-500">
          Showing entries sorted by {selectedEmotion} intensity ({sortDirection === 'desc' ? 'highest to lowest' : 'lowest to highest'})
        </div>
      )}
    </div>
  );
};

export default EmotionFilter;