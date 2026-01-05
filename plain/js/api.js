let config = {
  baseUrl: 'http://localhost:3000',
  apiKey: ''
};

export function setConfig(newConfig) {
  config = { ...config, ...newConfig };
}

function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json', 'x-api-key': config.apiKey };
  if (withAuth && localStorage.getItem('token')) {
    h['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }
  return h;
}

export function login(email, password) {
  // devuelve una promesa
  return fetch(`${config.baseUrl}/auth/login`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ email, password })
  })
  .then(async res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

export function register(user) {
  return fetch(`${config.baseUrl}/auth/register`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify(user)
  })
  .then(async res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

export function getVacancies(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== '') qs.append(k, v); });
  const url = `${config.baseUrl}/vacancies${qs.toString() ? `?${qs.toString()}` : ''}`;
  return fetch(url, { headers: headers(false) })
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
}

export function getVacancyById(id) {
  return fetch(`${config.baseUrl}/vacancies/${id}`, { headers: headers(false) })
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
}

export default { setConfig, login, register, getVacancies, getVacancyById };
