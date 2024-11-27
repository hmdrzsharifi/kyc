import React, { createContext, useContext, useEffect, useState } from 'react';
import { initKeycloak, keycloak, logout } from '../config/keycloak';

const KeycloakContext = createContext({
    initialized: false,
    authenticated: false,
    user: null,
    logout: () => {},
});

export const KeycloakProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            initKeycloak()
                .then(auth => {
                    setAuthenticated(auth);
                    if (keycloak && auth) {
                        const tokenParsed = keycloak.tokenParsed || {};
                        console.log({tokenParsed})
                        setUser({
                            name: tokenParsed.preferred_username || 'Unknown User',
                            email: tokenParsed.email || 'No Email',
                        });
                    }
                    setInitialized(true);
                })
                .catch(err => {
                    console.error('Failed to initialize Keycloak', err);
                    setInitialized(false); // Set initialized to false on error
                });
        }
    }, []);

    return (
        <KeycloakContext.Provider value={{ initialized, authenticated, user, logout }}>
            {children}
        </KeycloakContext.Provider>
    );
};

export const useKeycloak = () => useContext(KeycloakContext);