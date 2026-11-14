import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/test-utils';
import { TagInput } from './TagInput';

describe('TagInput component', () => {
  it('renders existing tags and placeholder', () => {
    render(<TagInput value={['inventory module', 'frontend']} placeholder="Add tag..." />);

    expect(screen.getByText('inventory module')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add more...')).toBeInTheDocument();
  });

  it('renders default placeholder when empty', () => {
    render(<TagInput value={[]} placeholder="Enter tags here" />);
    expect(screen.getByPlaceholderText('Enter tags here')).toBeInTheDocument();
  });

  it('adds a new tag when Enter is pressed', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TagInput value={['bug']} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Add more...');
    await user.type(input, 'inventory module{enter}');

    expect(handleChange).toHaveBeenCalledWith(['bug', 'inventory module']);
  });

  it('adds a new tag when comma is pressed', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TagInput value={[]} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, 'inventory module,');

    expect(handleChange).toHaveBeenCalledWith(['inventory module']);
  });

  it('does not add duplicate tags or empty tags', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TagInput value={['inventory module']} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Add more...');
    await user.type(input, 'inventory module{enter}');
    expect(handleChange).not.toHaveBeenCalled();

    await user.type(input, '   {enter}');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('removes a tag when remove button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TagInput value={['inventory module', 'api']} onChange={handleChange} />);

    const removeBtn = screen.getByRole('button', { name: /remove tag inventory module/i });
    await user.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith(['api']);
  });

  it('removes the last tag on Backspace when input is empty', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TagInput value={['inventory module', 'api']} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Add more...');
    await user.type(input, '{backspace}');

    expect(handleChange).toHaveBeenCalledWith(['inventory module']);
  });

  it('handles paste with comma separated values', () => {
    const handleChange = vi.fn();

    render(<TagInput value={['existing']} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Add more...');
    // Simulate paste
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
    Object.assign(pasteEvent, {
      clipboardData: {
        getData: (format: string) => (format === 'text' ? 'billing, checkout, auth' : ''),
      },
    });
    input.dispatchEvent(pasteEvent);

    expect(handleChange).toHaveBeenCalledWith(['existing', 'billing', 'checkout', 'auth']);
  });

  it('disables input and hides remove buttons when disabled', () => {
    render(<TagInput value={['tag1']} disabled />);

    const input = screen.getByPlaceholderText('Add more...');
    expect(input).toBeDisabled();
    expect(screen.queryByRole('button', { name: /remove tag/i })).not.toBeInTheDocument();
  });
});
