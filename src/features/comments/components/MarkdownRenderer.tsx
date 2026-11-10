import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownRendererProps {
  content: string;
  activeMemberNames?: string[];
  className?: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  activeMemberNames = [],
  className = '',
}) => {
  // Pre-process valid @mentions into markdown links targeted for mention pills
  const processedContent = useMemo(() => {
    if (!activeMemberNames.length || !content.includes('@')) {
      return content;
    }

    // Sort member names by descending length so "John Doe" is matched before "John"
    const sortedNames = [...activeMemberNames]
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => b.length - a.length);

    let result = content;
    for (const name of sortedNames) {
      const regex = new RegExp(`@(${escapeRegex(name)})(?=\\b|\\s|[.,!?;:]|$)`, 'gi');
      result = result.replace(regex, '[@$1](#mention)');
    }
    return result;
  }, [content, activeMemberNames]);

  return (
    <div className={`prose-sm max-w-none break-words text-sm text-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href === '#mention') {
              return (
                <span className="inline-flex items-center rounded-badge bg-accent/15 px-1.5 py-0.5 text-xs font-semibold text-accent">
                  {children}
                </span>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline =
              !codeClassName && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code
                  className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-xs text-accent"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2 overflow-x-auto rounded-card border border-border bg-surface-hover p-3 font-mono text-xs text-text">
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-accent/40 pl-3 italic text-text-muted">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse border border-border text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-surface-hover p-2 text-left font-semibold text-text">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border p-2 text-text-muted">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
