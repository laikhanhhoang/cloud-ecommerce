import { useMutation } from '@tanstack/react-query';
import { register } from '../api/authApi';

export function useRegister() {
  return useMutation({
    mutationFn: (payload) => register(payload),
  });
}
