import { useState, useEffect } from "react";
import { WatchlistDoc } from "../sample_structs";
import { listRepository } from "../repositories/ListRepository";

export const useList = (userId: string, initialList?: WatchlistDoc) => {
    const [list, setList] = useState<WatchlistDoc>(
        initialList || {
            name: '',
            owner_user_id: userId,
            visibility: 'private',
            description: '',
            group_id: '0',
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            item_count: 0,
            preview_covers: [],
            items: [],
        }
    )

    // Update owner_user_id when userId changes (and we don't have an initialList)
    useEffect(() => {
        if (!initialList && userId && userId !== '0') {
            setList(prev => ({ ...prev, owner_user_id: userId }));
        }
    }, [userId, initialList]);

    const updateList = (updates: Partial<WatchlistDoc>) => {
        setList((prev) => ({ ...prev, ...updates }));
    }

    const saveList = async (): Promise<void> => {
        if (list.id) {
            // update existing list in firebase
            await listRepository.update(list);
        } else {
            // add new list to firebase
            await listRepository.add(list);
        }
    }

    const deleteList = async (): Promise<void> => {
        if (list.id) {
            await listRepository.delete(list.id);
        }
    }

    return {
        list,
        updateList,
        saveList,
        deleteList,
    }
}