import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui';

export interface MentionMember {
  _id: string;
  name: string;
}

export interface MentionAutocompleteProps {
  members: MentionMember[];
  query: string;
  isOpen: boolean;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  members,
  query,
  isOpen,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || filteredMembers.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredMembers[selectedIndex];
        if (selected) {
          onSelect(selected.name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredMembers, selectedIndex, onSelect, onClose]);

  if (!isOpen || filteredMembers.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 z-30 mb-1 w-64 overflow-hidden rounded-card border border-border bg-surface shadow-elevated">
      <div className="border-b border-border bg-surface-hover px-3 py-1.5 text-[11px] font-medium text-text-muted">
        Mention a member
      </div>
      <ul
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        aria-label="Suggested members"
        aria-activedescendant={
          filteredMembers[selectedIndex] ? `mention-option-${selectedIndex}` : undefined
        }
        className="max-h-48 overflow-y-auto p-1"
      >
        {filteredMembers.map((member, index) => {
          const isSelected = index === selectedIndex;
          return (
            <li
              key={member._id}
              id={`mention-option-${index}`}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => onSelect(member.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelect(member.name);
              }}
              className={`flex cursor-pointer items-center gap-2.5 rounded-button px-2.5 py-1.5 text-xs transition-colors ${
                isSelected ? 'bg-accent/15 text-accent font-medium' : 'text-text hover:bg-surface-hover'
              }`}
            >
              <Avatar name={member.name} size="sm" />
              <span className="truncate">{member.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
