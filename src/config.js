const ABS_DEFAULT_API_BASE_URL = 'https://abs-yt.chua.codes';
const ABS_API_BASE_URL_KEY = 'abs_apiBaseUrl';

function normalizeApiBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function apiOriginPattern(baseUrl) {
  const parsed = new URL(normalizeApiBaseUrl(baseUrl));
  return `${parsed.protocol}//${parsed.host}/*`;
}

function getApiBaseUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(ABS_API_BASE_URL_KEY, result => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const stored = result[ABS_API_BASE_URL_KEY];
      resolve(normalizeApiBaseUrl(stored || ABS_DEFAULT_API_BASE_URL));
    });
  });
}

async function apiUrl(path) {
  const base = await getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function ensureApiHostPermission(baseUrl) {
  const origin = apiOriginPattern(baseUrl);
  const defaultOrigin = apiOriginPattern(ABS_DEFAULT_API_BASE_URL);

  if (origin === defaultOrigin) return true;
  if (!chrome.permissions || !chrome.permissions.request) return true;

  const alreadyGranted = await chrome.permissions.contains({ origins: [origin] });
  if (alreadyGranted) return true;

  return chrome.permissions.request({ origins: [origin] });
}

async function setApiBaseUrl(url) {
  const normalized = normalizeApiBaseUrl(url);
  if (!normalized) {
    throw new Error('API URL is required');
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (e) {
    throw new Error('Enter a valid URL, including http:// or https://');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('API URL must use http:// or https://');
  }

  const granted = await ensureApiHostPermission(normalized);
  if (!granted) {
    throw new Error('Host permission was not granted for that API URL');
  }

  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ [ABS_API_BASE_URL_KEY]: normalized }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });

  return normalized;
}

async function resetApiBaseUrl() {
  await new Promise((resolve, reject) => {
    chrome.storage.local.remove(ABS_API_BASE_URL_KEY, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
  return ABS_DEFAULT_API_BASE_URL;
}
