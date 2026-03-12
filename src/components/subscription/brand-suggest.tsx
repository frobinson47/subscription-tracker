'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/subscription/brand-logo';
import { searchBrands, type BrandMatch } from '@/lib/brand-logos';

interface BrandSuggestProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BrandSuggest({ value, onChange, placeholder = 'e.g. Netflix' }: BrandSuggestProps) {
  const [matches, setMatches] = useState<BrandMatch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const updateMatches = useCallback((query: string) => {
    const results = searchBrands(query);
    setMatches(results);
    setIsOpen(results.length > 0);
    setActiveIndex(-1);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    updateMatches(val);
  };

  const selectMatch = (match: BrandMatch) => {
    onChange(match.name);
    setIsOpen(false);
    setMatches([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || matches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectMatch(matches[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && updateMatches(value)}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="brand-suggest-list"
        aria-activedescendant={activeIndex >= 0 ? `brand-option-${activeIndex}` : undefined}
        autoComplete="off"
      />
      {isOpen && matches.length > 0 && (
        <>
          <span className="sr-only" aria-live="polite">
            {matches.length} suggestion{matches.length !== 1 ? 's' : ''} available
          </span>
          <ul
            ref={listRef}
            id="brand-suggest-list"
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden"
          >
            {matches.map((match, i) => (
              <li
                key={match.slug}
                id={`brand-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors
                  ${i === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectMatch(match);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <BrandLogo name={match.name} size={24} />
                <span>{match.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
