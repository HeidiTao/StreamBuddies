// adapted from lab 7
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserDoc } from '../sample_structs';


export class UserRepository {
    private collectionName = 'users';

    /**
    * Subscribe to real-time updates for all tasks
    * @param callback Function to call when tasks are updated
    * @returns Unsubscribe function
    */
    subscribe(callback: (users: UserDoc[]) => void): () => void {
        // establishes a reference to the specific location of data
        const usersCollection = collection(db, this.collectionName);
        
        // onSnapshot: a method that attaches a listener to a specific point in the database
        // when `taskCollection` changes, the function is immediately executed
        return onSnapshot(usersCollection, (querySnapshot) => {
            const users: UserDoc[] = [];
            querySnapshot.forEach((doc) => {
                // oh wow Firebase is smart and only sends the diffs
                const data = doc.data();
                users.push({
                    id: doc.id,
                    user_name: data.user_name,
                    phone_number: data.phone_number,
                    birthday: data.birthday,
                    join_date: data.join_date?.toDate(),
                    streaming_services: data.streaming_services,
                    // friends: data.friends,
                    profile_pic: data.profile_pic,//??'https://reactnative.dev/img/tiny_logo.png',// todo: will switch later to the default head thingy
                    created_at: data.created_at?.toDate(),
                    updated_at: data.updated_at?.toDate(),
                });
            });

            callback(users);
        });
    }

    subscribeToUser(uid: string, callback: (user: UserDoc|null) => void): () => void {
        const userDocRef = doc(db, this.collectionName, uid);

        return onSnapshot(userDocRef, (docSnap) => {
            if (!docSnap.exists()) {
                callback(null);  // no profile exists yet :(
                return;
            }

            const data = docSnap.data();
            callback({
                id: docSnap.id,
                user_name: data.user_name,
                phone_number: data.phone_number,
                birthday: data.birthday,
                join_date: data.join_date?.toDate(),
                streaming_services: data.streaming_services,
                // friends: data.friends,
                profile_pic: data.profile_pic,//??'https://reactnative.dev/img/tiny_logo.png',// todo: will switch later to the default head thingy
                created_at: data.created_at?.toDate(),
                updated_at: data.updated_at?.toDate(),
            });
        })
    }

    async getUser(uid: string): Promise<UserDoc|null> {
        const userDocRef = doc(db, this.collectionName, uid);
        const snap = await getDoc(userDocRef);

        if (!snap.exists()) return null; // does not exist in database

        const data = snap.data();
        return ({
            id: snap.id,
            user_name: data.user_name,
            phone_number: data.phone_number,
            birthday: data.birthday,
            join_date: data.join_date?.toDate(),
            streaming_services: data.streaming_services,
            // friends: data.friends,
            profile_pic: data.profile_pic,//??'https://reactnative.dev/img/tiny_logo.png',// todo: will switch later to the default head thingy
            created_at: data.created_at?.toDate(),
            updated_at: data.updated_at?.toDate(),
        })
    }

    // we want the id to be the one that firebase auth assigned; 
    // so we dont wanna use addDoc which would be creating a random ID for new documents
    async create(uid: string, data: Omit<UserDoc, 'id'>) {
        const userDocRef = doc(db, this.collectionName, uid);
        await setDoc(userDocRef, {
            ...data,
            created_at: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
        });
    }

    /**
    * Update an existing user
    * @param user User to update (must have id)
    */
    async update(user: UserDoc): Promise<void> {
        console.log("in update");
        if (!user.id) {
            throw new Error('User must have an id to be updated');
        }
        const userDoc = doc(db, this.collectionName, user.id);
        console.log("hei")
        await updateDoc(userDoc, {
            user_name: user.user_name,
            // don't allow updating phone number since that's the unique identification
            join_date: user.join_date,
            birthday: user.birthday,
            // don't allow editing join date
            streaming_services: user.streaming_services,
            // friends: user.friends,
            profile_pic: user.profile_pic,
            // created_at: user.created_at, // only changes upon Create
            updated_at: Timestamp.fromDate(new Date()), // whenever update is completed 
        });
    }

    /**
    * Delete a user
    * @param userId ID of user to delete
    */
    async delete(userId: string): Promise<void> {
        const userDoc = doc(db, this.collectionName, userId);
        await deleteDoc(userDoc);
    }
}

// Export a singleton instance    
export const userRepository = new UserRepository();