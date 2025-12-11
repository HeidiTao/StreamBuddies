// adapted from lab 7
import { useState, useEffect } from 'react';
import { WatchlistDoc } from '../sample_structs';
import { listRepository } from '../repositories/ListRepository';
import { useAuth } from './useAuth';

export const useLists = () => {
    const { authUser } = useAuth();
    const [lists, setLists] = useState<WatchlistDoc[]>([]);
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        if (!authUser) {
            setLists([]);
            setListLoading(false);
            return;
        }

        // Subscribe to list updates from Firestore
        const unsubscribe = listRepository.subscribe(authUser.uid, (updatedLists) => {
            setLists(updatedLists);
            setListLoading(false);
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [authUser]);

    return { lists, listLoading };
};