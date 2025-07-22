"use client"
import { createContext, ReactNode, useContext } from "react";

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ user, children} : {user: User, children: ReactNode}) => {
    return(
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);