// GroupRepository.ts - Add userId to group creation
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { GroupDoc, UserDoc } from '../sample_structs';

export class GroupRepository {
  private collectionName = 'groups';

  subscribeToUserGroups(userId: string, callback: (groups: GroupDoc[]) => void): () => void {
    const groupsCollection = collection(db, this.collectionName);
    const q = query(groupsCollection, where('member_ids', 'array-contains', userId));
    
    return onSnapshot(q, (querySnapshot) => {
      const groups: GroupDoc[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          created_by: data.created_by,
          member_ids: data.member_ids,
          member_count: data.member_count,
          code: data.code,
          currently_watching: data.currently_watching,
          finished: data.finished,
          comments: data.comments, // ← Make sure this line exists
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      });
      callback(groups);
    });
  }

  async createGroup(userId: string, groupData: Omit<GroupDoc, 'id'>): Promise<GroupDoc> {
    const groupsCollection = collection(db, this.collectionName);
    
    // Generate a 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newGroup = {
      ...groupData,
      created_by: userId,
      member_ids: [userId], // Creator is automatically a member
      code: code,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    };
    
    const docRef = await addDoc(groupsCollection, newGroup);
    return { ...newGroup, id: docRef.id, created_at: Date.now(), updated_at: Date.now() };
  }

  async deleteGroup(groupId: string): Promise<void> {
    const groupDoc = doc(db, this.collectionName, groupId);
    await deleteDoc(groupDoc);
  }

  async joinGroup(code: string, userId: string): Promise<GroupDoc | null> {
    const groupsCollection = collection(db, this.collectionName);
    const q = query(groupsCollection, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const groupDoc = snapshot.docs[0];
    const groupRef = doc(db, this.collectionName, groupDoc.id);
    const data = groupDoc.data();
    
    // Add user to member_ids if not already there
    if (!data.member_ids?.includes(userId)) {
      await updateDoc(groupRef, {
        member_ids: [...(data.member_ids || []), userId],
        member_count: (data.member_count || 0) + 1,
        updated_at: Timestamp.fromDate(new Date()),
      });
    }
    
    return { ...data, id: groupDoc.id } as GroupDoc;
  }

  // Fetch a group with all its member details
  async getGroupWithMembers(groupId: string): Promise<{ group: GroupDoc; members: UserDoc[] } | null> {
    const groupDoc = doc(db, this.collectionName, groupId);
    const groupSnap = await getDoc(groupDoc);
    
    if (!groupSnap.exists()) return null;
    
    const groupData = groupSnap.data();
    const group: GroupDoc = {
      id: groupSnap.id,
      name: groupData.name,
      description: groupData.description,
      created_by: groupData.created_by,
      member_ids: groupData.member_ids,
      member_count: groupData.member_count,
      code: groupData.code,
      currently_watching: groupData.currently_watching,
      finished: groupData.finished,
      created_at: groupData.created_at,
      updated_at: groupData.updated_at,
    };
    
    // Fetch all member details
    const members: UserDoc[] = [];
    if (groupData.member_ids && groupData.member_ids.length > 0) {
      const usersCollection = collection(db, 'users');
      for (const memberId of groupData.member_ids) {
        const userDocRef = doc(usersCollection, memberId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          members.push({
            id: userSnap.id,
            user_name: userData.user_name,
            phone_number: userData.phone_number,
            birthday: userData.birthday,
            join_date: userData.join_date?.toDate(),
            streaming_services: userData.streaming_services,
            profile_pic: userData.profile_pic,
            created_at: userData.created_at?.toDate(),
            updated_at: userData.updated_at?.toDate(),
          });
        }
      }
    }
    
    return { group, members };
  }
}

export const groupRepository = new GroupRepository();