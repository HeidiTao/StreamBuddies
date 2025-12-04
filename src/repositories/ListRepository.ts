// adapted from lab 7
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
// import { Task } from '../models/Task';
import { WatchlistDoc } from '../sample_structs';

export class ListRepository {
    private collectionName = 'watchLists';

    /**
    * Subscribe to real-time updates for all watchlists
    * @param callback Function to call when watchlists are updated
    * @returns Unsubscribe function
    */
    subscribe(callback: (lists: WatchlistDoc[]) => void): () => void {
        // establishes a reference to the specific location of data
        const listsCollection = collection(db, this.collectionName);
        
        // onSnapshot: a method that attaches a listener to a specific point in the database
        // when `listsCollection` changes, the function is immediately executed
        return onSnapshot(listsCollection, (querySnapshot) => {
            const lists: WatchlistDoc[] = [];
            querySnapshot.forEach((doc) => {
                // oh wow Firebase is smart and only sends the diffs
                const data = doc.data();
                lists.push({
                    id: doc.id,
                    name: data.name,
                    owner_user_id: '0',
                    visibility: data.visibility,   // "private" | "shared"
                    description: data.description,
                    // group_id?: ID;                     // /groups/{groupId} if shared
                    created_at: data.created_at?.toDate(),
                    updated_at: data.updated_at?.toDate(),
                    item_count: data.item_count,               // denorm
                    preview_covers: data.preview_covers,  
                    items: data.items,
                });
            });
            // Sort lists: incomplete first, then by due date - from lab 7
            // lists.sort((a, b) => {
            //     if (a.completed !== b.completed) {
            //         return a.completed ? 1 : -1;
            //     }
            //     return a.dueDate.getTime() - b.dueDate.getTime();
            // });

            callback(lists);
        });
    }

    /**
    * Add a new list to Firestore
    * @param list List to add (without id); Firebase automatically generates unique ID
    * @returns doesn't return anything itself, but the caller can await the function 
    * to ensure the list has finished saving to the database
    */
    async add(list: Omit<WatchlistDoc, 'id'>): Promise<void> {
        const listsCollection = collection(db, this.collectionName);
        await addDoc(listsCollection, {
            name: list.name,
            owner_user_id: list.owner_user_id,
            visibility: list.visibility,
            group_id: list.group_id,
            descrption: list.description,
            created_at: Timestamp.fromDate(new Date()), // whenever the creation is completed
            updated_at: Timestamp.fromDate(new Date()),
            item_count: 0,               // denorm
            preview_covers: ['https://reactnative.dev/img/tiny_logo.png'],
        });
    }

    /**
    * Update an existing list
    * @param list List to update (must have id)
    */
    async update(list: WatchlistDoc): Promise<void> {
        if (!list.id) {
            throw new Error('List must have an id to be updated');
        }
        const listDoc = doc(db, this.collectionName, list.id);
        await updateDoc(listDoc, {
            name: list.name,
            owner_user_id: list.owner_user_id,
            description: list.description,
            visibility: list.visibility,
            group_id: list.group_id,
            created_at: list.created_at,
            updated_at: Timestamp.fromDate(new Date()), // whenever update is completed
            // item_count?: number;               // denorm
            // preview_covers?: string[];  
        });
    }

    /**
    * Delete a list
    * @param listId ID of list to delete
    */
    async delete(listId: string): Promise<void> {
        const listDoc = doc(db, this.collectionName, listId);
        await deleteDoc(listDoc);
    }

    /**
    * Toggle the completed status of a list
    * @param list list to toggle
    */
    async toggleVisibility(list: WatchlistDoc): Promise<void> {
        if (!list.id) {
            throw new Error('List must have an id to be updated');
        }
        
        const listDoc = doc(db, this.collectionName, list.id);
        await updateDoc(listDoc, {
            visibility: !list.visibility,
        });
    }
}

// Export a singleton instance
export const listRepository = new ListRepository();