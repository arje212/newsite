import { useEffect, useState } from 'react';
import { api } from '@/api/client';

/* Loads all rows of an entity once. `published` hides rows the admin switched off. */
export function useEntityList(entity, sort, { published = false } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.entities[entity].list(sort)
      .then((rows) => { if (active) setItems(published ? rows.filter((r) => r.is_published !== false) : rows); })
      .catch((e) => { if (active) setError(e); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entity, sort, published]);

  return { items, loading, error };
}
