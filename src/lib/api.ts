// type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
//   const token = localStorage.getItem('token');

//   const res = await fetch(`/api${path}`, {
//     method,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
//   });

//   const data = await res.json();

//   if (res.status === 401) {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.dispatchEvent(new CustomEvent('auth:unauthorized'));
//   }

//   if (!res.ok) throw new Error(data.message ?? 'Request failed');
//   return data as T;
// }

// export const api = {
//   get: <T>(path: string) => request<T>('GET', path),
//   post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
//   patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
//   delete: (path: string) => request<void>('DELETE', path),
// };







type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const API_URL = 'https://todo-server-3pac.onrender.com/api';

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};