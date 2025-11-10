import { collection, onSnapshot, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { GroupDoc } from '../sample_structs';


import { addDoc } from 'firebase/firestore';

function generateRandomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

class GroupRepository {
    subscribe(callback: (groups: GroupDoc[]) => void) {
        // Create a query for all groups
        const q = query(collection(db, 'groups'));
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const groups: GroupDoc[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                groups.push({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    created_by: data.created_by,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    member_count: data.member_count,
                    code: data.code
                } as GroupDoc);
            });
            callback(groups);
        });
        return unsubscribe;
    }

    async createGroup(group: GroupDoc) {
        try {
            // generate a unique code and ensure no repeats
            let code = generateRandomCode();
            const maxAttempts = 10;
            let attempts = 0;
            while (attempts < maxAttempts) {
                const q = query(collection(db, 'groups'), where('code', '==', code));
                const snap = await getDocs(q);
                if (snap.empty) break; // unique
                code = generateRandomCode();
                attempts += 1;
            }
            // attach code to group and save
            const groupToSave = { ...group, code };
            const docRef = await addDoc(collection(db, 'groups'), groupToSave);
            console.log('Group created with ID:', docRef.id, 'code:', code);
            // return the saved group including id and generated code so callers can navigate/display immediately
            return { id: docRef.id, ...groupToSave } as GroupDoc;
        } catch (error) {
            console.error('Error creating group in Firebase:', error);
            throw error;
        }
    }

    async deleteGroup(groupId: string) {
        try {
            await deleteDoc(doc(db, 'groups', groupId));
            console.log('Group deleted:', groupId);
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }
}

export const groupRepository = new GroupRepository();