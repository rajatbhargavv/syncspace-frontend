import React, { useEffect, useRef, useState } from 'react';
import { Button, Tabs, type TabItem } from '@/components/ui';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MentionAutocomplete, type MentionMember } from './MentionAutocomplete';

export interface CommentComposerProps {
  taskId: string;
  members?: MentionMember[];
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: (content: string, onErrorDraft: (draft: string) => void) => unknown;
  isPending?: boolean;
}

const TABS: TabItem[] = [
  { id: 'write', label: 'Write' },
  { id: 'preview', label: 'Preview' },
];

const MAX_CHARS = 2000;

export const CommentComposer: React.FC<CommentComposerProps> = ({
  taskId,
  members = [],
  disabled = false,
  disabledReason,
  onSubmit,
  isPending = false,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [isMentionOpen, setIsMentionOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftKey = `syncspace:draft:task:${taskId}`;

  // Load draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) setContent(saved);
    } catch {
      // sessionStorage unavailable
    }
  }, [draftKey]);

  // Persist draft to sessionStorage
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    try {
      if (newContent) {
        sessionStorage.setItem(draftKey, newContent);
      } else {
        sessionStorage.removeItem(draftKey);
      }
    } catch {
      // ignore
    }

    // Check for @mention trigger
    const textarea = textareaRef.current;
    if (textarea) {
      const cursor = textarea.selectionStart;
      const textBeforeCursor = newContent.slice(0, cursor);
      const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_\s]*)$/);

      if (match && match[1] !== undefined && !match[1].includes('\n') && match[1].length <= 25) {
        setMentionQuery(match[1]);
        setMentionStartIndex(cursor - match[1].length - 1);
        setIsMentionOpen(true);
      } else {
        setIsMentionOpen(false);
      }
    }
  };

  const handleSelectMention = (name: string) => {
    if (mentionStartIndex === null) return;
    const textarea = textareaRef.current;
    const cursor = textarea ? textarea.selectionStart : content.length;

    const before = content.slice(0, mentionStartIndex);
    const after = content.slice(cursor);
    const insertion = `@${name} `;
    const updated = before + insertion + after;

    handleContentChange(updated);
    setIsMentionOpen(false);
    setMentionStartIndex(null);

    // Reposition cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = before.length + insertion.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 0);
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CHARS || isPending || disabled) return;

    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    const previousText = content;
    setContent('');
    setActiveTab('write');

    await onSubmit(trimmed, (draft) => {
      // Restore draft on error
      setContent(draft || previousText);
      try {
        sessionStorage.setItem(draftKey, draft || previousText);
      } catch {
        // ignore
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS - 100;
  const activeMemberNames = members.map((m) => m.name);

  if (disabled) {
    return (
      <div className="bg-surface-hover/40 rounded-card border border-border p-4 text-center text-xs text-text-muted">
        {disabledReason || 'Commenting is disabled for this item.'}
      </div>
    );
  }

  return (
    <div className="relative rounded-card border border-border bg-surface shadow-card">
      {/* Autocomplete listbox popup */}
      <MentionAutocomplete
        members={members}
        query={mentionQuery}
        isOpen={isMentionOpen}
        onSelect={handleSelectMention}
        onClose={() => setIsMentionOpen(false)}
      />

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'write' | 'preview')}
          variant="pills"
        />
        <span className="text-[11px] text-text-muted">Markdown supported</span>
      </div>

      {/* Body: Write vs Preview */}
      <div className="p-3">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Leave a comment... (Type @ to mention team members)"
            rows={4}
            className="w-full resize-y rounded-input border-0 bg-transparent p-1 text-sm text-text placeholder:text-text-muted focus:outline-none"
            aria-label="Comment composer"
          />
        ) : (
          <div className="min-h-[96px] rounded-input bg-bg p-3">
            {content.trim() ? (
              <MarkdownRenderer content={content} activeMemberNames={activeMemberNames} />
            ) : (
              <p className="text-xs italic text-text-muted">Nothing to preview</p>
            )}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <footer className="bg-surface-hover/30 flex items-center justify-between border-t border-border px-3 py-2 text-xs">
        <div className="flex items-center gap-2 text-text-muted">
          <span
            className={`font-mono text-[11px] ${
              isOverLimit ? 'font-bold text-error' : isNearLimit ? 'text-warning' : ''
            }`}
          >
            {charCount} / {MAX_CHARS}
          </span>
          <span className="text-text-muted/60 hidden sm:inline">• Cmd+Enter to comment</span>
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isOverLimit || isPending}
        >
          {isPending ? 'Commenting...' : 'Comment'}
        </Button>
      </footer>
    </div>
  );
};
