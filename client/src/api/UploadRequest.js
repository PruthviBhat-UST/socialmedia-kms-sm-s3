import axios from 'axios';

const API = axios.create({ baseURL: 'http://3.110.223.70:4000' });

export const uploadImage = (data) => API.post('/upload/', data);
export const uploadPost = (data) => API.post('/post', data);
