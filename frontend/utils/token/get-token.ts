import Cookies from 'js-cookie';

// Get access token from client-side cookies
export function getAccessTokenCookie(): string | false {
    const accessToken = Cookies.get('access');
    return accessToken || false;
}

// Get refresh token from client-side cookies
export function getRefreshTokenCookie(): string | false {
    const refreshToken = Cookies.get('refresh');
    return refreshToken || false;
}

// Set access token in client-side cookies
export function setAccessTokenCookie(token: string, expiresIn: number = 3600) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (expiresIn * 1000));
    
    Cookies.set('access', token, {
        expires: expiryDate,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
    });
}

// Set refresh token in client-side cookies
export function setRefreshTokenCookie(token: string, expiresIn: number = 2592000) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (expiresIn * 1000));
    
    Cookies.set('refresh', token, {
        expires: expiryDate,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
    });
}

// Clear all tokens from client-side cookies
export function clearTokens() {
    Cookies.remove('access');
    Cookies.remove('refresh');
    Cookies.remove('user');
}
