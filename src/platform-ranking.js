import { RANKING_ENDPOINT } from './ranking-config.js';
import { buildBoard, validateEntry } from './ranking-core.js';
const LOCAL_KEY = 'jabongi-local-ranking', PROFILE_KEY = 'jabongi-ranking-profile', CLIENT_KEY = 'jabongi-client-id';
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

export function createRanking({endpoint = globalThis.JABONGI_RANKING_ENDPOINT ?? RANKING_ENDPOINT, storage = safe(() => localStorage, null), fetchImpl = globalThis.fetch?.bind(globalThis), now = () => Date.now()} = {}) {
 const read = (key, fallback) => safe(() => JSON.parse(storage.getItem(key)) ?? fallback, fallback);
 const write = (key, value) => safe(() => storage.setItem(key, JSON.stringify(value)));
 const clientId = () => { let id = read(CLIENT_KEY, ''); if (!id) { id = safe(() => crypto.randomUUID(), String(now()) + Math.random().toString(16).slice(2)); write(CLIENT_KEY, id); } return id; };
 const localRows = () => { const rows = read(LOCAL_KEY, []); return Array.isArray(rows) ? rows : []; };
 async function call(url, options) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
  try { const response = await fetchImpl(url, {...options, signal:controller.signal}); if (!response.ok) throw Error(`HTTP ${response.status}`); return await response.json(); } finally { clearTimeout(timer); }
 }
 function saveLocal(entry) {
  const rows = [...localRows(), {...entry, time:now()}].sort((a, b) => b.score - a.score).slice(0, 100); write(LOCAL_KEY, rows);
  const board = buildBoard(rows, {mode:entry.mode, now:now()});
  return {ok:true, online:false, rank:board.ranks[`${entry.nickname}\u0001${entry.group}`], total:board.total};
 }
 return {
  online: !!endpoint && !!fetchImpl,
  profile: () => read(PROFILE_KEY, {nickname:'', group:''}),
  async submit(input) {
   const entry = validateEntry(input); if (!entry.ok) return entry;
   write(PROFILE_KEY, {nickname:entry.nickname, group:entry.group});
   if (endpoint && fetchImpl) {
    // text/plain keeps this a "simple" request, which Apps Script accepts without a CORS preflight.
    try { const result = await call(endpoint, {method:'POST', body:JSON.stringify({...entry, clientId:clientId()})}); if (result.ok) { saveLocal(entry); return {...result, online:true}; } return result; }
    catch { return {...saveLocal(entry), offline:true}; }
   }
   return saveLocal(entry);
  },
  async board(options) {
   if (endpoint && fetchImpl) {
    try { const query = new URLSearchParams({mode:options.mode, period:options.period, view:options.view}); return {...await call(`${endpoint}?${query}`, {method:'GET'}), online:true}; }
    catch { return {...buildBoard(localRows(), {...options, now:now()}), online:false, offline:true}; }
   }
   return {...buildBoard(localRows(), {...options, now:now()}), online:false};
  },
 };
}

// A near-perfect automated run scores about 5,900, so S stays reachable for strong human play.
export const gradeFor = score => score >= 5000 ? 'S' : score >= 3800 ? 'A' : score >= 2500 ? 'B' : 'C';
