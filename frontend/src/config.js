const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:5000/api'
  : 'https://jira-clone-backend-good.vercel.app/api'; 