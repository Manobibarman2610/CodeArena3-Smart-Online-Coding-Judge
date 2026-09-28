/* ════════════════════════════════════════════════════
   CODE ARENA — Centralized API Client
   All backend calls go through this module.
════════════════════════════════════════════════════ */
'use strict';

const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = window.CODEARENA_API_URL
  || (isLocalHost && window.location.port
      ? `${window.location.protocol}//${window.location.host}/api`
      : window.location.protocol === 'file:'
        ? 'http://localhost:5001/api'
        : '/api');

// ── Token Management ──
function getToken()       { return localStorage.getItem('ca_token'); }
function setToken(t)      { localStorage.setItem('ca_token', t); }
function removeToken()    { localStorage.removeItem('ca_token'); localStorage.removeItem('ca_user'); }
function getUser()        { try { return JSON.parse(localStorage.getItem('ca_user')); } catch { return null; } }
function setUser(u)       { localStorage.setItem('ca_user', JSON.stringify(u)); }
function isLoggedIn()     { return !!getToken(); }

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value !== 'string') return [];
  const text = value.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'string' && parsed.trim()) return parsed.split(',').map(item => item.trim()).filter(Boolean);
    return [];
  } catch {
    return text.split(',').map(item => item.trim()).filter(Boolean);
  }
}

// ── Core Fetch Wrapper ──
async function apiFetch(endpoint, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, opts);
  } catch (netErr) {
    throw new Error('Cannot connect to server. Please verify backend is running and reachable.');
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    const msg = data.message || (data.errors && data.errors[0]?.msg) || 'Request failed';
    throw Object.assign(new Error(msg), { status: res.status, data });
  }
  return data;
}

// ════════════════════════════════════
// AUTH
// ════════════════════════════════════
const Auth = {
  async register(name, email, password, role, institution) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password, role, institution }, auth: false });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  async login(email, password, role) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password, role }, auth: false });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  async me() {
    return apiFetch('/auth/me');
  },

  logout() {
    removeToken();
    const isPagesDir = window.location.pathname.includes('/pages/');
    window.location.href = isPagesDir ? '../index.html' : 'index.html';
  }
};

// ════════════════════════════════════
// USERS
// ════════════════════════════════════
const Users = {
  getProfile:    (id)             => apiFetch(`/users/${id}`),
  getStats:      (id)             => apiFetch(`/users/${id}/stats`),
  getActivity:   (id)             => apiFetch(`/users/${id}/activity`),
  getSubmissions:(id, page = 1)   => apiFetch(`/users/${id}/submissions?page=${page}`),
  updateProfile: (id, data)       => apiFetch(`/users/${id}`, { method: 'PUT', body: data }),
};

// ════════════════════════════════════
// PROBLEMS
// ════════════════════════════════════
const Problems = {
  list: ({ difficulty, topic, search, page } = {}) => {
    const q = new URLSearchParams();
    if (difficulty) q.set('difficulty', difficulty);
    if (topic)      q.set('topic', topic);
    if (search)     q.set('search', search);
    if (page)       q.set('page', page);
    return apiFetch(`/problems?${q.toString()}`);
  },
  getAssignments: () => apiFetch('/problems/assignments/list'),
  getById:     (id)   => apiFetch(`/problems/${id}`),
  getBySlug:   (slug) => apiFetch(`/problems/slug/${slug}`),
  getHints:    (id)   => apiFetch(`/problems/${id}/hints`),
  unlockHint:  (id, hintNum) => apiFetch(`/problems/${id}/hints/${hintNum}/unlock`, { method: 'POST' }),
  create:      (data) => apiFetch('/problems', { method: 'POST', body: data }),
  update:      (id, data) => apiFetch(`/problems/${id}`, { method: 'PUT', body: data }),
  delete:      (id)   => apiFetch(`/problems/${id}`, { method: 'DELETE' }),
  addTestCase: (id, tc) => apiFetch(`/problems/${id}/testcases`, { method: 'POST', body: tc }),
};

// ════════════════════════════════════
// SUBMISSIONS
// ════════════════════════════════════
const Submissions = {
  submit: (problemId, language, code, contestId = null) =>
    apiFetch('/submissions', { method: 'POST', body: { problem_id: problemId, language, code, contest_id: contestId } }),

  run: (language, code, stdin = '', expectedOutput = '') =>
    apiFetch('/submissions/run', { method: 'POST', body: { language, code, stdin, expected_output: expectedOutput } }),

  getById: (id) => apiFetch(`/submissions/${id}`),

  getByProblem: (pid) => apiFetch(`/submissions/problem/${pid}`),

  // Poll until verdict is no longer 'Pending'
  async pollResult(submissionId, onUpdate, maxWait = 30000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      await new Promise(r => setTimeout(r, 1000));
      const data = await this.getById(submissionId);
      if (onUpdate) onUpdate(data.submission);
      if (data.submission && data.submission.verdict !== 'Pending') return data.submission;
    }
    return null;
  }
};

// ════════════════════════════════════
// CONTESTS
// ════════════════════════════════════
const Contests = {
  list: ({ status, type, page } = {}) => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (type)   q.set('type', type);
    if (page)   q.set('page', page);
    return apiFetch(`/contests?${q.toString()}`);
  },
  getById:      (id)   => apiFetch(`/contests/${id}`),
  create:       (data) => apiFetch('/contests', { method: 'POST', body: data }),
  join:         (id)   => apiFetch(`/contests/${id}/join`, { method: 'POST' }),
  leaderboard:  (id)   => apiFetch(`/contests/${id}/leaderboard`),
  submissions:  (id)   => apiFetch(`/contests/${id}/submissions`),
};

// ════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════
const Leaderboard = {
  global:  (page = 1) => apiFetch(`/leaderboard/global?page=${page}`),
  top3:    ()         => apiFetch('/leaderboard/top3'),
  myRank:  ()         => apiFetch('/leaderboard/myrank'),
  contest: (id)       => apiFetch(`/leaderboard/contest/${id}`),
};

// ════════════════════════════════════
// FACULTY
// ════════════════════════════════════
const Faculty = {
  getOverview:      ()           => apiFetch('/faculty/overview'),
  getStudents:      ()           => apiFetch('/faculty/students'),
  getStudentReport: (id)         => apiFetch(`/faculty/students/${id}/report`),
  createAssignment: (data)       => apiFetch('/faculty/assignments', { method: 'POST', body: data }),
  getAssignments:   ()           => apiFetch('/faculty/assignments'),
  getAnalytics:     ()           => apiFetch('/faculty/analytics'),
  plagiarismReport: (contestId)  => apiFetch(`/faculty/plagiarism/${contestId}`),
};

// ════════════════════════════════════
// ADMIN
// ════════════════════════════════════
const Admin = {
  getUsers: ({ role, search, page = 1, limit = 50 } = {}) => {
    const q = new URLSearchParams({ page, limit });
    if (role) q.set('role', role);
    if (search) q.set('search', search);
    return apiFetch(`/admin/users?${q.toString()}`);
  },
  changeRole: (id, role) => apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
  deactivateUser: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  setUserStatus: (id, is_active) => apiFetch(`/admin/users/${id}/status`, { method: 'PUT', body: { is_active } }),
  getStats: () => apiFetch('/admin/stats'),
  getSystemHealth: () => apiFetch('/admin/system/health'),
  getRoles: () => apiFetch('/admin/roles'),
  createUser: (data) => apiFetch('/admin/users', { method: 'POST', body: data }),
  resetPassword: (id, password) => apiFetch(`/admin/users/${id}/password`, { method: 'PUT', body: { password } }),
  getActivity: (limit = 40) => apiFetch(`/admin/system/activity?limit=${limit}`),
  getPermissions: () => apiFetch('/admin/permissions'),
  getSettings: () => apiFetch('/admin/settings'),
  updateSettings: (settings) => apiFetch('/admin/settings', { method: 'PUT', body: { settings } }),
};

// ════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════
const Notifications = {
  list: () => apiFetch('/notifications'),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
};

// ════════════════════════════════════
// PRACTICE SYSTEM (5 Languages & Role-Based Practice)
// ════════════════════════════════════
const Practice = {
  getLanguages:         ()                             => apiFetch('/practice/languages'),
  getRoles:             ()                             => apiFetch('/practice/roles'),
  getRolePreference:    ()                             => apiFetch('/practice/role-preference'),
  setRolePreference:    (data)                         => apiFetch('/practice/role-preference', { method: 'POST', body: data }),
  getRoleRoadmap:       ()                             => apiFetch('/practice/role-roadmap'),
  getPrograms:          (language, params = {})        => {
    const q = new URLSearchParams(params);
    return apiFetch(`/practice/${language}?${q.toString()}`);
  },
  getProgram:           (id)                           => apiFetch(`/practice/program/${id}`),
  run:                  (language, code, stdin = '', expected = '') => 
    apiFetch('/practice/run', { method: 'POST', body: { language, code, stdin, expected_output: expected } }),
  submit:               (programId, language, code)    => 
    apiFetch('/practice/submit', { method: 'POST', body: { program_id: programId, language, code } }),
  getRecommendations:   ()                             => apiFetch('/practice/recommendations'),
  createProgram:        (data)                         => apiFetch('/practice/create', { method: 'POST', body: data }),
};

// ════════════════════════════════════
// PERSONALIZED LEARNING PATHS
// ════════════════════════════════════
const LearningPath = {
  get:                  ()                             => apiFetch('/practice/learning-path'),
};

// ── Export everything ──
window.CA = { Auth, Users, Problems, Submissions, Contests, Leaderboard, Faculty, Admin, Practice, LearningPath, Notifications, isLoggedIn, getUser, parseArray };
