import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GoogleAuthWrapper = ({ children }) => {
    return (
        <GoogleOAuthProvider clientId="907842385473-m4o5usepc70enftf6heo2dmuctns2hdd.apps.googleusercontent.com">
            {children}
        </GoogleOAuthProvider>
    );
};

export default GoogleAuthWrapper;
