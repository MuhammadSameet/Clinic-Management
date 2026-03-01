export const validators = {
  name: (v: string) => v.length >= 3 || 'Name must be at least 3 characters',
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email',
  password: (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  age: (v: number) => (v >= 1 && v <= 120) || 'Age must be between 1-120',
  contact: (v: string) => /^[0-9]{11}$/.test(v) || 'Contact must be 11 digits',
  date: (v: string) => new Date(v) >= new Date(new Date().toDateString()) || 'Date cannot be in the past',
  required: (v: any) => !!v || 'This field is required',
};
