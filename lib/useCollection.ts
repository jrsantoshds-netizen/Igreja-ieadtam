import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function useCollection<T>(table: string, congregacao?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!congregacao) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let q;
    if (congregacao === '*') {
      q = query(collection(db, table));
    } else {
      q = query(collection(db, table), where('congregacao', '==', congregacao));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as T));
      setData(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error in onSnapshot:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [table, congregacao]);

  return { data, loading };
}
