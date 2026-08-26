const TOKEN_KEY = 'ft_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Error ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password }, auth: false }),
  me: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  crearSolicitud: (payload) => request('/solicitudes', { method: 'POST', body: payload, auth: false }),
  listarSolicitudes: () => request('/solicitudes'),
  obtenerSolicitud: (id) => request(`/solicitudes/${id}`),
  actualizarEstado: (id, payload) => request(`/solicitudes/${id}/estado`, { method: 'PATCH', body: payload }),

  listarComisiones: () => request('/comisiones'),
  listarDirectorio: () => request('/directorio', { auth: false }),

  listarUsuarios: () => request('/usuarios'),
  crearUsuario: (payload) => request('/usuarios', { method: 'POST', body: payload }),
  actualizarUsuario: (id, payload) => request(`/usuarios/${id}`, { method: 'PATCH', body: payload }),
  resetPassword: (id, newPassword) => request(`/usuarios/${id}/reset-password`, { method: 'POST', body: { newPassword } }),
};
