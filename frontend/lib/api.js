const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Refresh token se naya access token lo
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  if (!response.ok) throw new Error('Session expired');

  // Naya token save karo
  localStorage.setItem('accessToken', data.data.accessToken);
  return data.data.accessToken;
};

const apiCall = async (endpoint, options = {}, retry = true) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  // Token expire hua → Auto refresh karo → Dobara try karo
  if (response.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();

      // Naye token se dobara call karo
      const retryConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers
        },
        ...options
      };

      const retryResponse = await fetch(`${API_URL}${endpoint}`, retryConfig);
      const retryData = await retryResponse.json();

      if (!retryResponse.ok) throw new Error(retryData.message || 'Something went wrong');
      return retryData;

    } catch (err) {
      // Refresh token bhi expire hua → Logout karo
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired, please login again');
    }
  }

  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// Auth APIs
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  logout: (refreshToken) => apiCall('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
};

// Course APIs
export const courseAPI = {
  getAll: (page = 1) => apiCall(`/courses?page=${page}`),
  getInstructorCourses: () => apiCall('/courses?role=INSTRUCTOR'), 
  getById: (id) => apiCall(`/courses/${id}`),
  create: (courseData) => apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  }),
  update: (id, data) => apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  remove: (id) => apiCall(`/courses/${id}`, {  // ← delete → remove
    method: 'DELETE'
  }),
  getMyEnrollments: () => apiCall('/courses/my-enrollments')
};

// Payment APIs
export const paymentAPI = {
  create: (paymentData) => apiCall('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),
  getMyPayments: () => apiCall('/payments'),
  getMyEnrollments: () => apiCall(`/courses/my-enrollments?t=${Date.now()}`)
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (data) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
// ```

// ---

// Ab flow yeh hoga:
// ```
// API call ki
//     ↓
// 401 aaya (token expire)
//     ↓
// Auto refresh token se naya token lo
//     ↓
// Same API call dobara karo
//     ↓
// User ko kuch pata bhi nahi chala ✅

// Refresh token bhi expire?
//     ↓
// Logout → Login page ✅