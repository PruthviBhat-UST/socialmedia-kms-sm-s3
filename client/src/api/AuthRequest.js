import axios from 'axios';

const API = axios.create({ baseURL: 'http://3.110.223.70:4000' });

export const logIn = (formData) => API.post('/auth/login', formData); 

export const signUp = (formData) => API.post('/auth/register', formData);
