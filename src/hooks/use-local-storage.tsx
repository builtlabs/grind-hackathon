import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const queryClient = useQueryClient();

  const value = useQuery({
    queryKey: [key],
    queryFn: () => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
      return initialValue;
    },
    refetchOnWindowFocus: false,
  });

  const setValue = useMutation({
    mutationKey: [key],
    mutationFn: async (value: T) => {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
      return value;
    },
    onSuccess(data) {
      queryClient.setQueryData([key], data);
    },
  });

  return {
    value: value.data,
    setValue: (newValue: T) => {
      setValue.mutate(newValue);
    },
    isPending: value.isPending || setValue.isPending,
  };
}
