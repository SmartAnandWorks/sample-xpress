import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommunicationsPreferences } from '@/components/profile/CommunicationsPreferences';
import { UserProfile } from '@/types/profile';

const mockProfile: UserProfile = {
  id: '123',
  address: '#74-02, 6 Jalan Besar, Singapore - 798379',
  phone: '1234567890',
  authentication_method: '+65-2093 2398',
  account_status: 'Active',
  contact_email: 'somchai.sirpattanakunchai@example.com',
  communication_language: 'US English',
  receive_promotional_offers: true,
  password_last_updated: '2025-04-25T19:04:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('CommunicationsPreferences', () => {
  it('renders communications preferences correctly', () => {
    const mockUpdate = jest.fn();
    render(<CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />);

    expect(screen.getByText('Communications preferences')).toBeInTheDocument();
    expect(screen.getByText('somchai.sirpattanakunchai@example.com')).toBeInTheDocument();
    expect(screen.getByText('US English')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const mockUpdate = jest.fn();
    render(<CommunicationsPreferences profile={null} onUpdate={mockUpdate} isLoading={true} />);

    expect(screen.getByText('Communications preferences')).toBeInTheDocument();
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('allows editing when Edit button is clicked', async () => {
    const mockUpdate = jest.fn();
    const user = userEvent.setup();

    render(<CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/communication language/i)).toBeInTheDocument();
    });
  });

  it('updates communications preferences on save', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const emailInput = screen.getByLabelText(/contact email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@example.com');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          contact_email: 'newemail@example.com',
        })
      );
    });
  });

  it('cancels editing when Cancel button is clicked', async () => {
    const mockUpdate = jest.fn();
    const user = userEvent.setup();

    render(<CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const emailInput = screen.getByLabelText(/contact email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@example.com');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('somchai.sirpattanakunchai@example.com')).toBeInTheDocument();
    });
  });

  it('displays description text', () => {
    const mockUpdate = jest.fn();
    render(<CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />);

    expect(
      screen.getByText("How you'd like to receive marketing and promotional updates.")
    ).toBeInTheDocument();
  });

  it('displays "No" when receive_promotional_offers is false', () => {
    const noOffersProfile: UserProfile = {
      ...mockProfile,
      receive_promotional_offers: false,
    };
    const mockUpdate = jest.fn();

    render(<CommunicationsPreferences profile={noOffersProfile} onUpdate={mockUpdate} />);

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('displays mail and globe icons', () => {
    const mockUpdate = jest.fn();
    const { container } = render(
      <CommunicationsPreferences profile={mockProfile} onUpdate={mockUpdate} />
    );

    const mailIcon = container.querySelector('svg.lucide-mail');
    const globeIcon = container.querySelector('svg.lucide-globe');

    expect(mailIcon).toBeInTheDocument();
    expect(globeIcon).toBeInTheDocument();
  });
});
