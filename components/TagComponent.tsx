import React from 'react';

interface TagProps {
  text: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

const TagComponent: React.FC<TagProps> = ({ text, onRemove, selected, onClick }) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-red-100 text-red-700 border-red-200',
    'bg-orange-100 text-orange-700 border-orange-200',
  ];

  // Generate color based on tag text
  const colorIndex = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const selectedClass = 'bg-indigo-600 text-white border-indigo-600';
  const colorClass = selected ? selectedClass : colors[colorIndex];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}`}
      onClick={onClick}
    >
      {text}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 ml-0.5 font-bold"
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagComponent;
