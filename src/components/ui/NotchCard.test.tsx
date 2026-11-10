import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/test-utils';
import { NotchCard } from './NotchCard';

describe('NotchCard component', () => {
  it('renders member variant correctly with name, role, and chips', () => {
    render(
      <NotchCard
        variant="member"
        name="Sarah Connor"
        memberRole="Space Owner"
        footerLeftLabel="Tasks"
        chips={['8 active', '2 done']}
        score={4}
        scoreLabel="Workload"
      />,
    );

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Space Owner')).toBeInTheDocument();
    expect(screen.getByText('8 active')).toBeInTheDocument();
    expect(screen.getByText('2 done')).toBeInTheDocument();
    expect(screen.getByText('Workload')).toBeInTheDocument();
  });

  it('triggers onArrowClick when arrow button is clicked', async () => {
    const handleArrowClick = vi.fn();
    const user = userEvent.setup();

    render(
      <NotchCard
        variant="member"
        name="John Doe"
        memberRole="Developer"
        onArrowClick={handleArrowClick}
      />,
    );

    const button = screen.getByRole('button', { name: /open item/i });
    await user.click(button);

    expect(handleArrowClick).toHaveBeenCalledTimes(1);
  });

  it('renders highlighted variant with bell button and unread dot', async () => {
    const handleBellClick = vi.fn();
    const user = userEvent.setup();

    render(
      <NotchCard
        variant="highlighted"
        title="Prepare Sprint Review"
        subtitle="Due in 2 hours"
        hasUnread={true}
        onBellClick={handleBellClick}
      />,
    );

    expect(screen.getByText('Prepare Sprint Review')).toBeInTheDocument();
    expect(screen.getByText('Due in 2 hours')).toBeInTheDocument();

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellBtn);
    expect(handleBellClick).toHaveBeenCalledTimes(1);
  });

  it('renders task variant with title and deadline', () => {
    render(
      <NotchCard
        variant="task"
        title="Fix Navbar z-index bug"
        subtitle="frontend/components"
        deadline="Tomorrow"
        isOverdue={false}
      />,
    );

    expect(screen.getByText('Fix Navbar z-index bug')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });
});
