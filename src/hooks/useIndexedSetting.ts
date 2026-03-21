import { useEffect, useRef, useState } from 'react';
import { getCachedValue, setCachedValue } from '../utils/indexedDbCache';

export const useIndexedSetting = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = await getCachedValue<T>(`setting:${key}`);
      if (!cancelled && cached) {
        setValue(cached.value);
      }
      loadedRef.current = true;
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!loadedRef.current) return;
    setCachedValue(`setting:${key}`, value).catch(() => {});
  }, [key, value]);

  return [value, setValue] as const;
};
