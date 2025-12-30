import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPassword } from '@/components/profile/LoginPassword';
import { UserProfile } from '@/types/profile';

const mockProfile: UserProfile = {
  id: '123',
  address: '#74-02, 6 Jalan Besar, Singapore - 798379',
  phone: '1234567890',
  authentication_method: '+65-2093 2398',
  account_status: 'Active',
  contact_email: 'test@example.com',
  communication_language: 'US English',
  receive_promotional_offers: true,
  password_last_updated: '2025-04-25T19:04:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('LoginPassword', () => {
  it('renders login and password information correctly', () => {
    const mockUpdate = jest.fn();
    render(<LoginPassword profile={mockProfile} onUpdate={mockUpdate} />);

    expect(screen.getByText('Login & password')).toBeInTheDocument();
    expect(screen.getByText(/Last Updated 25-04-2025/)).toBeInTheDocument();
    expect(screen.getByText('+65-2093 2398')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const mockUpdate = jest.fn();
    render(<LoginPassword profile={null} onUpdate={mockUpdate} isLoading={true} />);

    expect(screen.getByText('Login & password')).toBeInTheDocument();
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('allows editing authentication method', async () => {
    const mockUpdate = jest.fn();
    const user = userEvent.setup();

    render(<LoginPassword profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/authentication method/i)).toBeInTheDocument();
    });
  });

  it('updates authentication method on save', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPassword profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const authInput = screen.getByLabelText(/authentication method/i);
    await user.clear(authInput);
    await user.type(authInput, '+65-1234 5678');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        authentication_method: '+65-1234 5678',
      });
    });
  });

  it('cancels editing when Cancel button is clicked', async () => {
    const mockUpdate = jest.fn();
    const user = userEvent.setup();

    render(<LoginPassword profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const authInput = screen.getByLabelText(/authentication method/i);
    await user.clear(authInput);
    await user.type(authInput, 'New Auth Method');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('+65-2093 2398')).toBeInTheDocument();
    });
  });

  it('displays description text', () => {
    const mockUpdate = jest.fn();
    render(<LoginPassword profile={mockProfile} onUpdate={mockUpdate} />);

    expect(
      screen.getByText('Settings to configure and secure your login credentials and password.')
    ).toBeInTheDocument();
  });

  it('displays "Not provided" when authentication method is empty', () => {
    const emptyProfile: UserProfile = {
      ...mockProfile,
      authentication_method: '',
    };
    const mockUpdate = jest.fn();

    render(<LoginPassword profile={emptyProfile} onUpdate={mockUpdate} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });
});
