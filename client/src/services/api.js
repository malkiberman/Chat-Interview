import { normalizeCandidate, normalizeCandidates } from '../utils/candidateViewModel';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  return data;
}

async function firstSuccessful(paths, options = {}) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (error) {
      lastError = error;
      if (error.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error('No API path succeeded.');
}

export async function submitInterview(payload) {
  const data = await firstSuccessful(
    ['/conversation'],
    { method: 'POST', body: JSON.stringify(payload) },
  );
  return normalizeCandidate(data);
}

export async function fetchCandidates() {
  const data = await firstSuccessful(['/candidates', '/conversations']);
  const list = Array.isArray(data) ? data : data?.items || data?.candidates || [];
  return normalizeCandidates(list);
}

export async function fetchCandidateById(id) {
  const data = await firstSuccessful([`/candidates/${id}`, `/conversations/${id}`]);
  return normalizeCandidate(data);
}
