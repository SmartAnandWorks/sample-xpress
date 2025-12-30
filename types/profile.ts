export interface UserProfile {
  id: string;
  address: string;
  phone: string;
  authentication_method: string;
  account_status: string;
  contact_email: string;
  communication_language: string;
  receive_promotional_offers: boolean;
  password_last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdatePayload {
  address?: string;
  phone?: string;
  authentication_method?: string;
  contact_email?: string;
  communication_language?: string;
  receive_promotional_offers?: boolean;
}
