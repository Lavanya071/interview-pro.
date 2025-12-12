// src/api.js
// Fake frontend-only API: stores everything in localStorage.
// Drop-in replacement for axios-based api used in the project.

const STORAGE_KEYS = {
  USERS: 'fp_users',
  QUESTIONS: 'fp_questions',
  TOKENS: 'fp_tokens', // maps token -> userId
  VOTES: 'fp_votes', // maps userId -> [questionId]
  BOOKMARKS: 'fp_bookmarks' // maps userId -> [questionId]
};

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// init defaults if missing
(function initDefaults() {
  if (!read(STORAGE_KEYS.USERS, null)) {
    // seed with one user for convenience: test@test.com / password: test123
    write(STORAGE_KEYS.USERS, [
      { id: 1, name: 'Test User', email: 'test@test.com', password: 'test123', createdAt: now() }
    ]);
  }
  if (!read(STORAGE_KEYS.QUESTIONS, null)) {
    write(STORAGE_KEYS.QUESTIONS, [
      {
        id: 1,
        question_text: 'What is React?',
        option_a: 'JS library',
        option_b: 'Framework',
        option_c: 'Language',
        option_d: 'Database',
        correct_option: 'A',
        category: 'Frontend',
        difficulty: 'Easy',
        votes: 3,
        created_by: 1,
        created_at: now()
      },
      {
        id: 2,
        question_text: 'What is Node.js?',
        option_a: 'JS runtime',
        option_b: 'Framework',
        option_c: 'Language',
        option_d: 'Database',
        correct_option: 'A',
        category: 'Backend',
        difficulty: 'Easy',
        votes: 1,
        created_by: 1,
        created_at: now()
      }
    ]);
  }
  if (!read(STORAGE_KEYS.TOKENS, null)) write(STORAGE_KEYS.TOKENS, {}); 
  if (!read(STORAGE_KEYS.VOTES, null)) write(STORAGE_KEYS.VOTES, {});
  if (!read(STORAGE_KEYS.BOOKMARKS, null)) write(STORAGE_KEYS.BOOKMARKS, {});
})();

// --- token handling (used by setAuthToken) ---
const apiDefaults = { headers: { common: {} } };
function setAuthToken(token) {
  if (token) {
    apiDefaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete apiDefaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

// helper to get current user from stored token (if valid)
function getUserFromToken(token) {
  if (!token) return null;
  const tokens = read(STORAGE_KEYS.TOKENS, {});
  const userId = tokens[token];
  if (!userId) return null;
  const users = read(STORAGE_KEYS.USERS, []);
  return users.find(u => u.id === userId) || null;
}

// helper to pull token from saved header or localStorage
function resolveTokenFromConfig() {
  // prefer explicit header saved in apiDefaults
  const header = apiDefaults.headers.common['Authorization'] || localStorage.getItem('token') || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : header || null;
  return token;
}

// --- fake API object (get/post) ---
const api = {
  defaults: apiDefaults,

  // GET handler
  get: (path) => {
    return new Promise((resolve, reject) => {
      try {
        // GET /questions -> return list sorted by votes desc
        if (path === '/questions') {
          const qs = read(STORAGE_KEYS.QUESTIONS, []).slice().sort((a,b)=>b.votes - a.votes);
          return resolve({ data: qs });
        }

        // GET /questions/:id
        const qMatch = path.match(/^\/questions\/(\d+)$/);
        if (qMatch) {
          const id = parseInt(qMatch[1], 10);
          const q = (read(STORAGE_KEYS.QUESTIONS, [])).find(x => x.id === id);
          if (!q) return reject({ response: { data: { msg: 'Question not found' } } });
          return resolve({ data: q });
        }

        // GET /users/bookmarks
        if (path === '/users/bookmarks') {
          const token = resolveTokenFromConfig();
          const user = getUserFromToken(token);
          if (!user) return reject({ response: { data: { msg: 'Unauthorized' } } });
          const bookmarks = read(STORAGE_KEYS.BOOKMARKS, {})[user.id] || [];
          const questions = read(STORAGE_KEYS.QUESTIONS, []);
          const rows = questions.filter(q => bookmarks.includes(q.id));
          return resolve({ data: rows });
        }

        // default: not implemented
        return reject({ response: { data: { msg: `GET ${path} not implemented in fake API` } } });
      } catch (err) {
        return reject({ response: { data: { msg: 'Server error' } } });
      }
    });
  },

  // POST handler
  post: (path, body) => {
    return new Promise((resolve, reject) => {
      try {
        // POST /auth/register
        if (path === '/auth/register') {
          const { name, email, password } = body || {};
          if (!name || !email || !password) {
            return reject({ response: { data: { msg: 'Missing fields' } } });
          }
          const users = read(STORAGE_KEYS.USERS, []);
          if (users.find(u => u.email === email)) {
            return reject({ response: { data: { msg: 'User already exists' } } });
          }
          const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
          const newUser = { id, name, email, password, createdAt: now() };
          users.push(newUser);
          write(STORAGE_KEYS.USERS, users);

          // create token entry
          const token = uid();
          const tokens = read(STORAGE_KEYS.TOKENS, {});
          tokens[token] = id;
          write(STORAGE_KEYS.TOKENS, tokens);

          return resolve({ data: { token, user: { id, name, email } } });
        }

        // POST /auth/login
        if (path === '/auth/login') {
          const { email, password } = body || {};
          if (!email || !password) return reject({ response: { data: { msg: 'Missing fields' } } });
          const users = read(STORAGE_KEYS.USERS, []);
          const user = users.find(u => u.email === email);
          if (!user) return reject({ response: { data: { msg: 'User not found' } } });
          // NOTE: frontend fake API stores plaintext password (no bcrypt). Compare directly.
          if (user.password !== password) return reject({ response: { data: { msg: 'Invalid credentials' } } });

          const token = uid();
          const tokens = read(STORAGE_KEYS.TOKENS, {});
          tokens[token] = user.id;
          write(STORAGE_KEYS.TOKENS, tokens);

          return resolve({ data: { token, user: { id: user.id, name: user.name, email: user.email } } });
        }

        // POST /questions (add new question) - requires auth
        if (path === '/questions') {
          const token = resolveTokenFromConfig();
          const user = getUserFromToken(token);
          if (!user) return reject({ response: { data: { msg: 'Unauthorized' } } });

          const { question_text, option_a, option_b, option_c, option_d, correct_option, category, difficulty } = body || {};
          if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
            return reject({ response: { data: { msg: 'Missing fields' } } });

          const questions = read(STORAGE_KEYS.QUESTIONS, []);
          const newId = questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1;
          const newQ = {
            id: newId,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            category: category || 'General',
            difficulty: difficulty || 'Medium',
            votes: 0,
            created_by: user.id,
            created_at: now()
          };
          questions.push(newQ);
          write(STORAGE_KEYS.QUESTIONS, questions);
          return resolve({ data: { msg: 'Question added', id: newId } });
        }

        // POST /questions/:id/vote
        const voteMatch = path.match(/^\/questions\/(\d+)\/vote$/);
        if (voteMatch) {
          const qId = parseInt(voteMatch[1], 10);
          const token = resolveTokenFromConfig();
          const user = getUserFromToken(token);
          if (!user) return reject({ response: { data: { msg: 'Unauthorized' } } });

          const votes = read(STORAGE_KEYS.VOTES, {});
          const userVotes = votes[user.id] || [];
          if (userVotes.includes(qId)) return reject({ response: { data: { msg: 'Already voted' } } });

          userVotes.push(qId);
          votes[user.id] = userVotes;
          write(STORAGE_KEYS.VOTES, votes);

          // increment question votes
          const questions = read(STORAGE_KEYS.QUESTIONS, []);
          const q = questions.find(x => x.id === qId);
          if (!q) return reject({ response: { data: { msg: 'Question not found' } } });
          q.votes = (q.votes || 0) + 1;
          write(STORAGE_KEYS.QUESTIONS, questions);

          return resolve({ data: { msg: 'Voted successfully' } });
        }

        // POST /users/bookmark
        if (path === '/users/bookmark') {
          const token = resolveTokenFromConfig();
          const user = getUserFromToken(token);
          if (!user) return reject({ response: { data: { msg: 'Unauthorized' } } });

          const { questionId } = body || {};
          if (!questionId) return reject({ response: { data: { msg: 'Missing questionId' } } });

          const bookmarks = read(STORAGE_KEYS.BOOKMARKS, {});
          const userBm = bookmarks[user.id] || [];
          if (userBm.includes(questionId)) return reject({ response: { data: { msg: 'Already bookmarked' } } });

          userBm.push(questionId);
          bookmarks[user.id] = userBm;
          write(STORAGE_KEYS.BOOKMARKS, bookmarks);

          return resolve({ data: { msg: 'Bookmarked' } });
        }

        // default: not implemented
        return reject({ response: { data: { msg: `POST ${path} not implemented in fake API` } } });
      } catch (err) {
        return reject({ response: { data: { msg: 'Server error' } } });
      }
    });
  }
};

// Export
export { setAuthToken };
export default api;
