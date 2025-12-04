import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser} from "firebase/auth";
import { auth } from "../../config/firebase";

export const useAuth = () => {
    const [authUser, setAuthUser] = useState<FirebaseUser|null>(null);
    const [loading, setLoading] = useState(true);
    // const [authRawPhone, setAuthRawPhone] = useState("");

    useEffect(() => {
        // const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // console.log("onAuthStateChanged!! ", user);
            setAuthUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return {
        authUser, loading, 
        // authRawPhone, setAuthRawPhone
    };

}