// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Phone number validation (basic - accepts 10+ digits)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
  return phoneRegex.test(phone.trim());
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Generic non-empty validation
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// Date validation (YYYY-MM-DD format)
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date.trim())) return false;

  const [year, month, day] = date.trim().split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

// Time validation (HH:MM format, 24-hour)
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time.trim());
};

// Check if date is in the future
export const isFutureDate = (date: string, time: string): boolean => {
  const visitDateTime = new Date(`${date.trim()}T${time.trim()}:00`);
  const now = new Date();
  return visitDateTime > now;
};

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM
export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
