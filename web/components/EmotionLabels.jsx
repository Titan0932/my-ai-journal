// @ts-nocheck comment at the top of a file
import React from 'react';

const EmotionLabel = ({ label, score }) => {

  console.log(label, score)
  // Get color based on emotion
  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'bg-yellow-200',
      sadness: 'bg-blue-200',
      anger: 'bg-red-200',
      fear: 'bg-purple-200',
      disgust: 'bg-green-200',
      surprise: 'bg-orange-200',
      neutral: 'bg-gray-200'
    };
    return colors[emotion] || 'bg-gray-200';
  };

  // Only show emotions with more than 1% score
  if (score < 0.01) return null;

  return (
    <div className={`inline-flex items-center rounded-full px-2 py-1 text-sm mr-2 mb-2 ${getEmotionColor(label)}`}>
      <span className="capitalize">{label}</span>
      <span className="ml-1 text-gray-600">
        {(score * 100).toFixed(1)}%
      </span>
    </div>
  );
};

const EmotionLabels = ({ moodscores }) => {
  // Sort emotions by score
  const sortedEmotions = [...moodscores].sort((a, b) => b.score - a.score);
  console.log("moodscores: ", moodscores)
  return (
    <div className="mt-2">
      {sortedEmotions.map(({ label, score }) => (
        <EmotionLabel key={label} label={label} score={score} />
      ))}
    </div>
  );
};

export default EmotionLabels;