// Observed through public browser interactions on 2026-11-03; see api-discovery.md.
export const PUBLIC_JOBS_ENDPOINTS = {
  suggestions: '/ro/ajax/tags',
  searchResults: '/ro/jobs-moldova-programator',
} as const;

export const PUBLIC_VACANCY_POPUP_QUERY = { json: 1, viewMode: 1 } as const;

export const PUBLIC_VIP_VACANCY_PATH =
  /^\/ro\/locuri-de-munca\/[a-z0-9-]+\/(?<id>[1-9]\d*)$/u;
