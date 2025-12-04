import { useCallback, useEffect, useState } from "react";
import { UserDoc } from "../sample_structs";
import { userRepository } from "../repositories/UserRepository";

export const useUserProfile = (uid?: string | null) => {
    const [profile, setProfile] = useState<UserDoc|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // console.log("[uid useEffect start] loading-", loading);
        if (!uid) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        const unsubscribe = userRepository.subscribeToUser(uid, (user) => {
            setProfile(user);
            setLoading(false);
            
            // console.log("[in unsubscribe] loading-", loading);
        });

        // console.log("[returning unsubscribe] loading-", loading);
        return unsubscribe;
    }, [uid])

    const createUser = useCallback(
        async (data: Omit<UserDoc, 'id'>) => {
            if (!uid) throw new Error("No auth UID available");
            await userRepository.create(uid, data);
        }, [uid]
    )

    const updateUser = useCallback(
        async (updates: Partial<UserDoc>) => {
            // console.log("hello?)")
            if (!uid) throw new Error("No auth UID available");
            if (!profile) {
                console.log("no profile");
                throw new Error("No profile loaded");
            }

            const updated = {...profile, ...updates};
            await userRepository.update(updated);
            setProfile(updated);
            console.log("Updated user", updated);
        }, [uid, profile]
    );

    const deleteUser = useCallback(
        async () => {
            if (!uid) throw new Error("No auth UID available");
            await userRepository.delete(uid);
        }, [uid]
    );
    

    return {
        // user,
        profile,
        setProfile,
        loading,
        createUser,
        updateUser,
        // saveUser,
        deleteUser,
    }
}