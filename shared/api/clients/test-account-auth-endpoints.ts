// Observed from the public Romanian form and an authorized account session on 2026-11-04.
export const ACCOUNT_AUTH_PATHS = {
  login: '/ro/login',
  home: '/ro/',
  accountLanding: '/ro/applicant/my-resumes',
  logout: '/ro/logout',
} as const;

export const ACCOUNT_LOGIN_FIELDS = {
  decoyLogin: 'fake1',
  decoyPassword: 'fake2',
  username: 'login',
  password: 'password',
  submit: 'do_login',
} as const;
