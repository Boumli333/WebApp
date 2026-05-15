const tokenKey = 'recipe_book_jwt';

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const request = { ...options, headers, credentials: 'include' };

  if (!['GET', 'HEAD'].includes((request.method || 'GET').toUpperCase())) {
    try {
      const csrfRes = await fetch(`${window.RECIPE_API_BASE}/auth/csrf-token`, { credentials: 'include' });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        request.headers['X-CSRF-Token'] = csrfData.csrfToken;
      }
    } catch (_error) {
      // Ignore if API has CSRF disabled in local test mode.
    }
  }

  const res = await fetch(`${window.RECIPE_API_BASE}${path}`, request);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

window.recipeCommon = { api, getToken, setToken, authHeaders };
