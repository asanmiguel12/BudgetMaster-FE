import { API_CONFIG } from './config';

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const url = `${API_CONFIG.baseUrl.replace(/\/$/, '')}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-User-Id': API_CONFIG.userId,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = responseBody?.error || `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, body: responseBody });
  }

  return responseBody;
}

export async function checkHealth() {
  return apiRequest('/health');
}
