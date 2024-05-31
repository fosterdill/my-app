import axios, { AxiosInstance } from 'axios';

const useAxios = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  });

  return apiClient;
};

export default useAxios;
