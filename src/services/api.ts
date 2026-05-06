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

export const notificationsAPI = {
  list:    () => request<any>('/notifications.php'),
  markAll: () => request<any>('/notifications.php', { method:'PUT' }),
};

export const messagesAPI = {
  list:   () => request<any[]>('/messages.php'),
  send:   (data: any) => request<any>('/messages.php', { method:'POST', body: JSON.stringify(data) }),
};

export const dashboardAPI = {
  stats: () => request<any>('/dashboard.php'),
};

export const etablissementsAPI = {
  list: () => request<any[]>('/etablissements.php'),
};

export const utilisateursAPI = {
  list: (role='') => request<any[]>(`/utilisateurs.php${role ? `?role=${role}` : ''}`),
};
