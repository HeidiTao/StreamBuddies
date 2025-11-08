// adapted from lab 7
import { useState, useEffect } from 'react';
import { WatchlistDoc } from '../sample_structs';
import { listRepository } from '../repositories/ListRepository';

export const useLists = () => {
    const [lists, setLists] = useState<WatchlistDoc[]>([]);
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        // Subscribe to list updates from Firestore
        const unsubscribe = listRepository.subscribe((updatedLists) => {
            setLists(updatedLists);
            setListLoading(false);
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { lists, listLoading };
};