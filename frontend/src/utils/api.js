export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('hk_token');

  // Set up default headers including the Authorization token
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  let finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    }
  };

  let response = await fetch(url, finalOptions);

  // If the token is invalid or expired
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('hk_refresh_token');
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          
          // Update tokens
          localStorage.setItem('hk_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('hk_refresh_token', data.refresh_token);
          }
          
          // Update the Authorization header and retry the original request
          finalOptions.headers['Authorization'] = `Bearer ${data.access_token}`;
          response = await fetch(url, finalOptions);
        } else {
          // Refresh token failed (e.g. it is also expired)
          localStorage.removeItem('hk_token');
          localStorage.removeItem('hk_refresh_token');
          window.location.href = '/login';
        }
      } catch (err) {
        localStorage.removeItem('hk_token');
        localStorage.removeItem('hk_refresh_token');
        window.location.href = '/login';
      }
    } else {
      // No refresh token available
      localStorage.removeItem('hk_token');
      window.location.href = '/login';
    }
  }

  return response;
};
