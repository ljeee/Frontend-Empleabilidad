import * as api from './api.js';

// carga config desde localStorage si existe
const savedConfig = JSON.parse(localStorage.getItem('plain_front_config') || '{}');
if (savedConfig.baseUrl || savedConfig.apiKey) api.setConfig(savedConfig);

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKeyInput');
  const baseUrlInput = document.getElementById('baseUrlInput');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const loginBtn = document.getElementById('loginBtn');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const authResult = document.getElementById('authResult');
  const getVacanciesBtn = document.getElementById('getVacanciesBtn');
  const vacancyFilter = document.getElementById('vacancyFilter');
  const vacanciesResult = document.getElementById('vacanciesResult');
  const vacancyId = document.getElementById('vacancyId');
  const getVacancyBtn = document.getElementById('getVacancyBtn');
  const vacancyResult = document.getElementById('vacancyResult');

  // rellenar inputs con config guardada
  apiKeyInput.value = savedConfig.apiKey || '';
  baseUrlInput.value = savedConfig.baseUrl || 'http://localhost:3000';

  saveConfigBtn.addEventListener('click', () => {
    const cfg = { apiKey: apiKeyInput.value.trim(), baseUrl: baseUrlInput.value.trim() };
    localStorage.setItem('plain_front_config', JSON.stringify(cfg));
    api.setConfig(cfg);
    alert('Configuración guardada');
  });

  loginBtn.addEventListener('click', () => {
    authResult.textContent = 'Cargando...';
    api.login(email.value, password.value)
      .then(data => {
        // guarda token localmente
        if (data && data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          authResult.textContent = JSON.stringify(data, null, 2);
        } else {
          authResult.textContent = 'Respuesta inesperada: ' + JSON.stringify(data);
        }
      })
      .catch(err => {
        authResult.textContent = 'Error: ' + err.message;
      });
  });

  getVacanciesBtn.addEventListener('click', () => {
    vacanciesResult.textContent = 'Cargando...';
    const filter = vacancyFilter.value.trim();
    const params = {};
    if (filter) {
      // asigna filtro a las posibles querys para demostrar uso
      params.technology = filter;
      params.seniority = filter;
      params.location = filter;
    }
    api.getVacancies(params)
      .then(data => { vacanciesResult.textContent = JSON.stringify(data, null, 2); })
      .catch(err => { vacanciesResult.textContent = 'Error: ' + err.message; });
  });

  getVacancyBtn.addEventListener('click', () => {
    const id = vacancyId.value.trim();
    if (!id) { vacancyResult.textContent = 'Ingresa un ID'; return; }
    vacancyResult.textContent = 'Cargando...';
    api.getVacancyById(id)
      .then(data => { vacancyResult.textContent = JSON.stringify(data, null, 2); })
      .catch(err => { vacancyResult.textContent = 'Error: ' + err.message; });
  });

});
