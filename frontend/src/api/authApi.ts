import { apiClient } from './client';

export const loginUser = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', email); // standard OAuth2 naming
  formData.append('password', password);

  const response = await apiClient.post('/auth/login', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const verifyOtp = async (userId: number, otpCode: string) => {
  const response = await apiClient.post('/auth/verify-otp', {
    user_id: userId,
    otp_code: otpCode,
  });
  return response.data;
};

export const signupUser = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/signup', { email, password });
  return response.data;
};
