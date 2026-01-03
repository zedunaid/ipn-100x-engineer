/**
 * SearchForm component tests
 *
 * Tests for:
 * - Form rendering (input and button)
 * - Input handling
 * - Form submission with trimmed location
 * - Loading state
 * - Button disabled states
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from '@/components/SearchForm';

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  describe('Rendering', () => {
    it('renders input and button correctly', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      // Check input is rendered with correct attributes
      const input = screen.getByLabelText(/enter your location/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute(
        'placeholder',
        'Enter address, city, or zip code...'
      );

      // Check button is rendered
      const button = screen.getByRole('button', { name: /find restaurants/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders the tip text', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
      expect(screen.getByText(/tip:/i)).toBeInTheDocument();
    });
  });

  describe('Button disabled states', () => {
    it('button is disabled when input is empty', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const button = screen.getByRole('button', { name: /find restaurants/i });
      expect(button).toBeDisabled();
    });

    it('button is disabled when input contains only whitespace', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);
      const button = screen.getByRole('button', { name: /find restaurants/i });

      fireEvent.change(input, { target: { value: '   ' } });
      expect(button).toBeDisabled();
    });

    it('button is enabled when input has valid text', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);
      const button = screen.getByRole('button', { name: /find restaurants/i });

      fireEvent.change(input, { target: { value: 'San Francisco' } });
      expect(button).not.toBeDisabled();
    });

    it('button is disabled when loading', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

      const input = screen.getByLabelText(/enter your location/i);
      fireEvent.change(input, { target: { value: 'San Francisco' } });

      const button = screen.getByRole('button', { name: /searching/i });
      expect(button).toBeDisabled();
    });

    it('input is disabled when loading', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

      const input = screen.getByLabelText(/enter your location/i);
      expect(input).toBeDisabled();
    });
  });

  describe('Loading state', () => {
    it('shows "Searching..." when loading', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

      expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /find restaurants/i })).not.toBeInTheDocument();
    });

    it('shows "Find Restaurants" when not loading', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      expect(screen.getByRole('button', { name: /find restaurants/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /searching/i })).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('calls onSearch with trimmed location on submit', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);
      const button = screen.getByRole('button', { name: /find restaurants/i });

      // Input with leading and trailing whitespace
      fireEvent.change(input, { target: { value: '  San Francisco  ' } });
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('San Francisco');
    });

    it('calls onSearch when form is submitted via enter key', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);

      fireEvent.change(input, { target: { value: 'Downtown' } });
      fireEvent.submit(input.closest('form')!);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('Downtown');
    });

    it('does not call onSearch when input is empty', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const form = screen.getByRole('button').closest('form')!;
      fireEvent.submit(form);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('does not call onSearch when input contains only whitespace', () => {
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);
      const form = input.closest('form')!;

      fireEvent.change(input, { target: { value: '    ' } });
      fireEvent.submit(form);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Input handling', () => {
    it('updates input value as user types', async () => {
      const user = userEvent.setup();
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);

      await user.type(input, '94102');

      expect(input).toHaveValue('94102');
    });

    it('clears input when value is deleted', async () => {
      const user = userEvent.setup();
      render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByLabelText(/enter your location/i);

      await user.type(input, 'test');
      await user.clear(input);

      expect(input).toHaveValue('');
    });
  });
});
