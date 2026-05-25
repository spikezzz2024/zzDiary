import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import AnalysisSidebar from '../AnalysisSidebar';
import type { AnalyzeResponse } from '../../../types/shared';

const defaultResult: AnalyzeResponse = {
  entryId: 1,
  emotionTags: ['焦虑', '内疚'],
  intensity: 7,
  cognitiveBiases: ['灾难化'],
  possibleRootCause: '可能是工作压力导致的',
  familyConnection: true,
  mindfulnessSuggestion: '尝试深呼吸，感受当下的身体状态',
};

function renderSidebar(result: Partial<AnalyzeResponse> = {}, onDismiss = vi.fn()) {
  return render(
    <MemoryRouter>
      <AnalysisSidebar result={{ ...defaultResult, ...result }} onDismiss={onDismiss} />
    </MemoryRouter>
  );
}

describe('AnalysisSidebar', () => {
  it('renders emotion tags', () => {
    renderSidebar();
    expect(screen.getByText('焦虑')).toBeInTheDocument();
    expect(screen.getByText('内疚')).toBeInTheDocument();
  });

  it('renders intensity bar and score', () => {
    renderSidebar();
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('renders root cause when present', () => {
    renderSidebar();
    expect(screen.getByText('可能是工作压力导致的')).toBeInTheDocument();
  });

  it('renders cognitive biases', () => {
    renderSidebar();
    expect(screen.getByText('灾难化')).toBeInTheDocument();
  });

  it('renders family connection indicator when true', () => {
    renderSidebar();
    expect(screen.getByText('与过往经历有关')).toBeInTheDocument();
  });

  it('does not render family connection when false', () => {
    renderSidebar({ familyConnection: false });
    expect(screen.queryByText('与过往经历有关')).not.toBeInTheDocument();
  });

  it('dismiss button calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderSidebar({}, onDismiss);
    // The dismiss button is the X icon button in the header
    const buttons = screen.getAllByRole('button');
    const dismissButton = buttons.find(b => b.querySelector('svg'));
    await user.click(dismissButton!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when no emotion tags', () => {
    renderSidebar({ emotionTags: [] });
    expect(screen.getByText('未检测到明显情绪')).toBeInTheDocument();
  });

  it('has link to mindfulness page when suggestion exists', () => {
    renderSidebar();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/mindfulness');
  });
});
