import { create } from 'zustand';
import { UserProfile } from '~/lib/api';

interface UserState {
    userProfile: UserProfile | null;
    setUserProfile: (user: UserProfile | null) => void;
}

const useUserProfileStore = create<UserState>((set) => ({
    userProfile: null,
    setUserProfile: (user) =>
        set({
            userProfile: user,
        })
}));

export default useUserProfileStore;