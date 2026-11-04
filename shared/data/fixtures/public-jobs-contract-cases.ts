// Sanitized synthetic contracts derived from authorized public observations.
const vacancyPath = '/ro/locuri-de-munca/synthetic-vacancy/123';

export const PUBLIC_JOBS_CONTRACT_CASES = {
  suggestions: { suggestions: [{ value: 'Synthetic profession', data: 123 }] },
  emptySuggestions: { suggestions: [] },
  // Sanitized reproduction of the blank label observed for whitespace input.
  blankSuggestion: { suggestions: [{ value: '', data: 123 }] },
  vacancy: {
    vacancy_model: null,
    data: {
      c_list: false,
      custom_link: null,
      company_ad: {
        company_ad_id: 123,
        showResumeBlock: 1,
        showResponseBlock: 1,
      },
    },
    vacancy_content: '<article>Synthetic vacancy</article>',
  },
  reference: { relativePath: vacancyPath, id: 123 },
  mixedLinks: `<a href="/ro/login">Account</a><a class="vacancyShowPopup" href="${vacancyPath}">Synthetic vacancy</a>`,
  noVacancy: '<a href="/ro/login">Account</a>',
  unrelatedLink: `<a href="${vacancyPath}">Unrelated link</a>`,
} as const;
