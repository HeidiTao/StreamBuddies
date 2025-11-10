import { useState, useEffect } from 'react';
import { GroupDoc } from '../sample_structs';
import { groupRepository } from '../repositories/GroupRepository';

export const useGroups = () => {
    const [groups, setGroups] = useState<GroupDoc[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to group updates from Firestore
        const unsubscribe = groupRepository.subscribe((updatedGroups) => {
            setGroups(updatedGroups);
            setGroupsLoading(false);
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { groups, groupsLoading };
};