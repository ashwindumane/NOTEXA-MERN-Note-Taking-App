import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const SearchBar = memo(({ 
  value, 
  onChange, 
  handleSearch, 
  onClearSearch, 
  allNotes = [] 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  // Generate search suggestions based on input
  const generateSuggestions = useCallback((searchValue) => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerCaseValue = searchValue.toLowerCase();
    const matchedNotes = allNotes.filter(note => {
      return (
        note.title.toLowerCase().includes(lowerCaseValue) ||
        note.content.toLowerCase().includes(lowerCaseValue) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerCaseValue))
      );
    });

    // Extract unique suggestions from matched notes
    const titleMatches = matchedNotes.map(note => note.title);
    const contentMatches = matchedNotes.flatMap(note => 
      note.content.split(' ').filter(word => 
        word.toLowerCase().includes(lowerCaseValue) && word.length > 3
      )
    );
    const tagMatches = matchedNotes.flatMap(note => note.tags);

    const uniqueSuggestions = [
      ...new Set([...titleMatches, ...contentMatches, ...tagMatches])
    ].slice(0, 5); // Limit to 5 suggestions

    setSuggestions(uniqueSuggestions);
  }, [allNotes]);

  // Handle input change with debounce
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    onChange(e);
    generateSuggestions(value);
    setShowSuggestions(true);
  }, [onChange, generateSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && showSuggestions) {
        e.preventDefault();
        if (suggestions[activeSuggestion]) {
          onChange({ target: { value: suggestions[activeSuggestion] } });
          setShowSuggestions(false);
          handleSearch(suggestions[activeSuggestion]);
        }
      }
    }
  }, [suggestions, activeSuggestion, showSuggestions, onChange, handleSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    onChange({ target: { value: suggestion } });
    handleSearch(suggestion);
    setShowSuggestions(false);
  }, [onChange, handleSearch]);

  return (
    <div className="relative w-80">
      <div className='flex items-center px-4 bg-slate-100 rounded-md'>
        <input
          type='text'
          placeholder='Search in titles, content or tags...'
          className='w-full text-xs bg-transparent py-[11px] outline-none'
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          aria-label='Search notes'
          autoComplete='off'
        />
        {value && (
          <IoMdClose 
            className='text-xl text-slate-500 cursor-pointer hover:text-black mr-3' 
            onClick={(e) => {
              e.stopPropagation();
              onClearSearch();
              setSuggestions([]);
            }}
            aria-label='Clear search'
          />
        )}
        <FaSearch 
          className="text-slate-400 cursor-pointer hover:text-black" 
          onClick={() => {
            handleSearch(value);
            setShowSuggestions(false);
          }}
          aria-label='Search'
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                index === activeSuggestion ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  allNotes: PropTypes.array,
};

export default SearchBar;