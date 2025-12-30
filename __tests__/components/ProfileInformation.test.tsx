import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
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

describe('ProfileInformation', () => {
  it('renders profile information correctly', () => {
    const mockUpdate = jest.fn();
    render(<ProfileInformation profile={mockProfile} onUpdate={mockUpdate} />);

    expect(screen.getByText('Personal information')).toBeInTheDocument();
    expect(screen.getByText('#74-02, 6 Jalan Besar, Singapore - 798379')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const mockUpdate = jest.fn();
    render(<ProfileInformation profile={null} onUpdate={mockUpdate} isLoading={true} />);

    expect(screen.getByText('Personal information')).toBeInTheDocument();
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('allows editing when Edit button is clicked', async () => {
    const mockUpdate = jest.fn();
    render(<ProfileInformation profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hand phone/i)).toBeInTheDocument();
    });
  });

  it('updates profile information on save', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ProfileInformation profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const addressInput = screen.getByLabelText(/address/i);
    await user.clear(addressInput);
    await user.type(addressInput, 'New Address');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        address: 'New Address',
        phone: '1234567890',
      });
    });
  });

  it('cancels editing when Cancel button is clicked', async () => {
    const mockUpdate = jest.fn();
    const user = userEvent.setup();

    render(<ProfileInformation profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const addressInput = screen.getByLabelText(/address/i);
    await user.clear(addressInput);
    await user.type(addressInput, 'New Address');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('#74-02, 6 Jalan Besar, Singapore - 798379')).toBeInTheDocument();
    });
  });

  it('displays "Not provided" when profile data is empty', () => {
    const emptyProfile: UserProfile = {
      ...mockProfile,
      address: '',
      phone: '',
    };
    const mockUpdate = jest.fn();

    render(<ProfileInformation profile={emptyProfile} onUpdate={mockUpdate} />);

    const notProvidedTexts = screen.getAllByText('Not provided');
    expect(notProvidedTexts.length).toBe(2);
  });
});
