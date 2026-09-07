async function request(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || `Erro ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }
  return data;
}

function postJson(url, body) {
  return request(url, { method: 'POST', body });
}

export function archiveApplications(jobIds) {
  return postJson('/api/applications/batch', { jobIds });
}

export function discardPosting(jobId) {
  return postJson('/api/postings/discard', { jobId });
}

export function getSyncStatus() {
  return request('/api/applications/sync-status');
}

export function listApplications(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  ).toString();
  return request(`/api/applications${qs ? `?${qs}` : ''}`);
}

export function getApplication(id) {
  return request(`/api/applications/${id}`);
}

export function patchApplication(id, patch) {
  return request(`/api/applications/${id}`, { method: 'PATCH', body: patch });
}

export function deleteApplication(id) {
  return request(`/api/applications/${id}`, { method: 'DELETE' });
}

export function addStage(applicationId, { stage, occurredAt, note }) {
  return postJson(`/api/applications/${applicationId}/stages`, { stage, occurredAt, note });
}

export function updateStage(applicationId, eventId, patch) {
  return request(`/api/applications/${applicationId}/stages/${eventId}`, { method: 'PATCH', body: patch });
}

export function removeStage(applicationId, eventId) {
  return request(`/api/applications/${applicationId}/stages/${eventId}`, { method: 'DELETE' });
}

export function getInsightsOverview(windowDays) {
  return request(`/api/insights/overview${windowDays ? `?windowDays=${windowDays}` : ''}`);
}

export function getInsightsTerms(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  ).toString();
  return request(`/api/insights/terms${qs ? `?${qs}` : ''}`);
}

export function getInsightsCompanies(minApplications) {
  return request(`/api/insights/companies${minApplications ? `?minApplications=${minApplications}` : ''}`);
}

export function reindex(force = false) {
  return postJson('/api/maintenance/reindex', { force });
}

export function getVocabulary(scope = 'posting') {
  return request(`/api/insights/vocabulary?scope=${scope}`);
}
