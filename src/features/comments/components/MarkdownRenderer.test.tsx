import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders standard markdown formatting', () => {
    const content = 'Here is **bold text** and `inline code`.';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('inline code')).toBeInTheDocument();
  });

  it('renders @mentions matching active members as badge pills', () => {
    const content = 'Hey @Alice check this out!';
    render(<MarkdownRenderer content={content} activeMemberNames={['Alice']} />);

    const mention = screen.getByText('@Alice');
    expect(mention).toBeInTheDocument();
    expect(mention.tagName).toBe('SPAN');
    expect(mention.className).toContain('text-accent');
  });

  it('renders external links with target="_blank" and rel="noopener noreferrer"', () => {
    const content = 'Check out [Documentation](https://example.com/docs).';
    render(<MarkdownRenderer content={content} />);

    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sanitizes unsafe script tags preventing execution', () => {
    const content = '<script>window.__pwned = true;</script>Safe text';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText(/Safe text/)).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });
});
