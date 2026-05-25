import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaperEditor from '../PaperEditor';
import { useDiaryStore } from '../diary.store';
import { usePaperStore } from '../paper.store';

describe('PaperEditor', () => {
  beforeEach(() => {
    useDiaryStore.setState({
      content: '',
      draftId: null,
      draftLoaded: true,
      saving: false,
      analyzing: false,
      currentResult: null,
      error: null,
    });
    usePaperStore.setState({ material: 'grid', color: 'classic' });
  });

  it('renders textarea', () => {
    render(<PaperEditor />);
    expect(screen.getByPlaceholderText(/今天发生了什么/)).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(<PaperEditor />);
    expect(screen.getByText('0 字')).toBeInTheDocument();
  });

  it('textarea accepts input and updates character count', async () => {
    const user = userEvent.setup();
    render(<PaperEditor />);
    const textarea = screen.getByPlaceholderText(/今天发生了什么/);
    await user.type(textarea, '今天天气很好');
    expect(screen.getByText('6 字')).toBeInTheDocument();
    expect(useDiaryStore.getState().content).toBe('今天天气很好');
  });

  it('analyze button is disabled when content is empty', () => {
    render(<PaperEditor />);
    const button = screen.getByRole('button', { name: /分析情绪/ });
    expect(button).toBeDisabled();
  });

  it('analyze button is enabled with content', async () => {
    const user = userEvent.setup();
    render(<PaperEditor />);
    const textarea = screen.getByPlaceholderText(/今天发生了什么/);
    await user.type(textarea, '今天心情不错');
    const button = screen.getByRole('button', { name: /分析情绪/ });
    expect(button).toBeEnabled();
  });

  it('shows paper type label', () => {
    render(<PaperEditor />);
    expect(screen.getByText('作文纸')).toBeInTheDocument();
  });

  it('shows analyzing state when analyzing', async () => {
    useDiaryStore.setState({ analyzing: true });
    render(<PaperEditor />);
    expect(screen.getByText('分析中...')).toBeInTheDocument();
  });
});
