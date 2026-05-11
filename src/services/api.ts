// ── Base API service ────────────────────────────────────────
const BASE = 'http://localhost:8000/api';

function getToken(): string {
  return localStorage.getItem('cp_token') || '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data as T;
}

export const authAPI = {
  login:  (email: string, mot_de_passe: string) =>
    request<{token:string; user:any}>('/auth.php?action=login', { method:'POST', body: JSON.stringify({email,mot_de_passe}) }),
  logout: () => request('/auth.php?action=logout', { method:'POST' }),
  me:     () => request<any>('/auth.php?action=me'),
  updatePassword: (data: { current_password: string; new_password: string }) =>
    request<any>('/auth.php?action=update_password', { method: 'POST', body: JSON.stringify(data) }),
};

export const forgotPasswordAPI = {
  request: (email: string) => request<any>('/forgot_password.php?action=request', { method: 'POST', body: JSON.stringify({ email }) }),
  verify:  (token: string) => request<any>(`/forgot_password.php?action=verify&token=${token}`),
  reset:   (token: string, password: string) => request<any>('/forgot_password.php?action=reset', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

export const patientsAPI = {
  list:   (q='') => request<any[]>(`/patients.php${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get:    (id: number) => request<any>(`/patients.php?id=${id}`),
  create: (data: any) => request<any>('/patients.php', { method:'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/patients.php?id=${id}`, { method:'PUT', body: JSON.stringify(data) }),
};

export const rdvAPI = {
  list:   (params: Record<string,any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/rdv.php${qs ? `?${qs}` : ''}`);
  },
  create:  (data: any) => request<any>('/rdv.php', { method:'POST', body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request<any>(`/rdv.php?id=${id}`, { method:'PUT', body: JSON.stringify(data) }),
  cancel:  (id: number) => request<any>(`/rdv.php?id=${id}`, { method:'DELETE' }),
};

export const consultationsAPI = {
  list:   (patient_id: number) => request<any[]>(`/consultations.php?patient_id=${patient_id}`),
  get:    (id: number) => request<any>(`/consultations.php?id=${id}`),
  create: (data: any) => request<any>('/consultations.php', { method:'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/consultations.php?id=${id}`, { method:'PUT', body: JSON.stringify(data) }),
};

export const prescriptionsAPI = {
  list:   (patient_id: number) => request<any[]>(`/prescriptions.php?patient_id=${patient_id}`),
  get:    (id: number) => request<any>(`/prescriptions.php?id=${id}`),
  create: (data: any) => request<any>('/prescriptions.php', { method:'POST', body: JSON.stringify(data) }),
};

export const examensAPI = {
  list:   (params: Record<string,any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/examens.php${qs ? `?${qs}` : ''}`);
  },
  create: (data: any) => request<any>('/examens.php', { method:'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/examens.php?id=${id}`, { method:'PUT', body: JSON.stringify(data) }),
};

export const transfertsAPI = {
  list:   (params: Record<string,any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/transferts.php${qs ? `?${qs}` : ''}`);
  },
  get:    (id: number) => request<any>(`/transferts.php?id=${id}`),
  create: (data: any) => request<any>('/transferts.php', { method:'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/transferts.php?id=${id}`, { method:'PUT', body: JSON.stringify(data) }),
};

export const notificationAPI = {
  getAll:    (user_id: number) => request<any[]>(`/notifications.php?user_id=${user_id}`),
  markRead:  (id: number, user_id: number) => request<any>(`/notifications.php?user_id=${user_id}`, { method:'POST', body: JSON.stringify({action:'mark_read', id}) }),
  markAllRead: (user_id: number) => request<any>(`/notifications.php?user_id=${user_id}`, { method:'POST', body: JSON.stringify({action:'mark_all_read'}) }),
  delete:    (id: number, user_id: number) => request<any>(`/notifications.php?user_id=${user_id}`, { method:'POST', body: JSON.stringify({action:'delete', id}) }),
  deleteAll: (user_id: number) => request<any>(`/notifications.php?user_id=${user_id}`, { method:'POST', body: JSON.stringify({action:'delete_all'}) }),
};

export const messagesAPI = {
  list:     () => request<any[]>('/messages.php'),
  send:     (data: any) => request<any>('/messages.php', { method:'POST', body: JSON.stringify(data) }),
  markRead: (interlocuteur_id: number) => request<any>(`/messages.php?interlocuteur_id=${interlocuteur_id}`, { method:'PUT' }),
};

export const dashboardAPI = {
  stats: () => request<any>('/dashboard.php'),
};

export const logsAPI = {
  list: () => request<any[]>('/logs.php'),
};

export const etablissementsAPI = {
  list: () => request<any[]>('/etablissements.php'),
};

export const utilisateursAPI = {
  list: (role='') => request<any[]>(`/utilisateurs.php${role ? `?role=${role}` : ''}`),
  create: (data: any) => request<any>('/utilisateurs.php', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>('/utilisateurs.php', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: number) => request<any>('/utilisateurs.php', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

export const settingsAPI = {
  get: () => request<Record<string, string>>('/settings.php'),
  update: (data: Record<string, string>) => request<any>('/settings.php', { method: 'POST', body: JSON.stringify(data) }),
};

export const adhesionsAPI = {
  list: () => request<any[]>('/adhesions.php'),
  submit: (data: any) => request<any>('/adhesions.php', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, statut: string, motif?: string) => request<any>(`/adhesions.php?id=${id}`, { method: 'PUT', body: JSON.stringify({ statut, motif }) }),
};
