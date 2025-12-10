// hooks/useGroups.ts
import { useEffect, useState } from 'react';
import { GroupDoc } from '../sample_structs';
import { groupRepository } from '../repositories/GroupRepository';
import { useAuth } from './useAuth';

export const useGroups = () => {
  const { authUser } = useAuth();
  const [groups, setGroups] = useState<GroupDoc[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setGroups([]);
      setGroupsLoading(false);
      return;
    }

    const unsubscribe = groupRepository.subscribeToUserGroups(authUser.uid, (updatedGroups) => {
      setGroups(updatedGroups);
      setGroupsLoading(false);
    });

    return unsubscribe;
  }, [authUser]);

  return { groups, groupsLoading };
};