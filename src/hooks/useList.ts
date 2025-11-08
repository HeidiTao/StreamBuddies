import { useState } from "react";
import { WatchlistDoc } from "../sample_structs";
import { listRepository } from "../repositories/ListRepository";

export const useList = (initialList?: WatchlistDoc) => {
    const [list, setList] = useState<WatchlistDoc>(
        initialList || {
            name: '',
            owner_user_id: '0',
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