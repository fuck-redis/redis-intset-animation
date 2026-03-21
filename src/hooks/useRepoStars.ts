import { useEffect, useState } from 'react';
import { getCachedValue, isFresh, setCachedValue } from '../utils/indexedDbCache';

const ONE_HOUR_MS = 60 * 60 * 1000;

interface RepoStarsState {
  stars: number;
  loading: boolean;
}

export const useRepoStars = (owner: string, repo: string) => {
  const [state, setState] = useState<RepoStarsState>({
    stars: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `github-stars:${owner}/${repo}`;

    const load = async () => {
      const cached = await getCachedValue<number>(cacheKey);

      if (cached) {
        setState({
          stars: cached.value,
          loading: !isFresh(cached.updatedAt, ONE_HOUR_MS),
        });
      }

      if (cached && isFresh(cached.updatedAt, ONE_HOUR_MS)) {
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/vnd.github+json',
          },
        });

        window.clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`GitHub API ${response.status}`);
        }

        const json = (await response.json()) as { stargazers_count?: number };
        const stars = Number(json.stargazers_count || 0);

        if (!cancelled) {
          setState({ stars, loading: false });
        }

        await setCachedValue(cacheKey, stars);
      } catch {
        if (cancelled) return;
        if (cached) {
          setState({ stars: cached.value, loading: false });
        } else {
          setState({ stars: 0, loading: false });
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return state;
};
