/**
 * ספר זיכרונות – יצחק רוזנר 100
 * Google Apps Script המחובר לגיליון Google Sheets בחשבון של אילון.
 *
 * doPost: מקבל זיכרון + קבצים מהאתר, שומר שורה ואת הקבצים ב-Drive,
 *         משתף את הקבצים כ-Anyone with the link (view), ומחזיר id + edit token.
 *         הזיכרון מתפרסם מיד (אין צורך באישור).
 * doPost {action:"update", id, token, ...}: עריכה אחרי אימות הטוקן.
 * doGet?action=list: כל השורות חוץ מאלה שבהן hidden = TRUE.
 *                    העמודה approved נשמרת לתאימות לאחור אך אינה מסוננת.
 *
 * עמודות: timestamp, name, relation, memory, links, email, files, approved,
 *         hidden, id, edit_token, edited_at
 */
const SHEET_NAME = 'submissions';
const FOLDER_NAME = 'יצחק רוזנר 100 – קבצים מהאתר';
const MAX_TOTAL_MB = 25;
const MAX_FILES = 20;
const LIMITS = { name: 100, relation: 100, memory: 10000, links: 1000, email: 200 };
const NOTIFY = true;
const HEADERS = ['timestamp', 'name', 'relation', 'memory', 'links', 'email', 'files', 'approved', 'hidden', 'id', 'edit_token', 'edited_at'];

function setup() {
  ensureSchema_();
  getFolder_();
}

function ensureSchema_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  } else {
    const existing = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(function (h) {
      return String(h || '').trim();
    });
    HEADERS.forEach(function (name) {
      if (existing.indexOf(name) === -1) {
        sh.getRange(1, sh.getLastColumn() + 1).setValue(name);
        existing.push(name);
      }
    });
    sh.setFrozenRows(1);
  }
  const headers = headerNames_(sh);
  const last = lastDataRow_(sh);
  if (last >= 2) {
    ['approved', 'hidden'].forEach(function (name) {
      const c = col_(headers, name);
      if (c) {
        try { sh.getRange(2, c, last - 1, 1).insertCheckboxes(); } catch (e) {}
      }
    });
  }
  return sh;
}

function getFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function clip_(s, n) { return String(s == null ? '' : s).slice(0, n); }

function headerNames_(sh) {
  return sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(function (h) {
    return String(h || '').trim();
  });
}

function col_(headers, name) { return headers.indexOf(name) + 1; }

function newId_() { return Utilities.getUuid(); }

function newToken_() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

function isHidden_(v) {
  return v === true || v === 'TRUE' || v === 'true' || v === 1 || v === '1';
}

function extractDriveId_(url) {
  const s = String(url || '');
  let m = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

function parseFiles_(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw.map(normFile_).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  if (s.charAt(0) === '[') {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(normFile_).filter(Boolean);
    } catch (e) {}
  }
  return s.split(/\n+/).filter(Boolean).map(normFile_).filter(Boolean);
}

function normFile_(f) {
  if (!f) return null;
  if (typeof f === 'string') {
    const id = extractDriveId_(f);
    return { id: id, url: f, name: '', type: '' };
  }
  const id = f.id || extractDriveId_(f.url);
  return {
    id: id,
    url: f.url || (id ? ('https://drive.google.com/file/d/' + id + '/view') : ''),
    name: f.name || '',
    type: f.type || ''
  };
}

function isImage_(type, name) {
  if (type && String(type).indexOf('image/') === 0) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(name || '');
}

function shareFile_(file) {
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
}

function publicFile_(f) {
  const id = f.id || extractDriveId_(f.url);
  const name = f.name || '';
  const type = f.type || '';
  const url = f.url || (id ? ('https://drive.google.com/file/d/' + id + '/view') : '');
  const out = { url: url, type: type, name: name };
  if (id) out.id = id;
  if (id && isImage_(type, name)) out.thumb = 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800';
  return out;
}

function ensureFilePublic_(f) {
  if (!f || !f.id) return;
  try { shareFile_(DriveApp.getFileById(f.id)); } catch (e) {}
}

function uploadFiles_(files, name) {
  const out = [];
  if (!files || !files.length) return out;
  const folder = getFolder_();
  const sub = folder.createFolder(new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + ' ' + name);
  let total = 0;
  files.slice(0, MAX_FILES).forEach(function (f) {
    const bytes = Utilities.base64Decode(f.data || '');
    total += bytes.length;
    if (total > MAX_TOTAL_MB * 1048576) throw new Error('too large');
    const mime = clip_(f.type, 100) || 'application/octet-stream';
    const fname = clip_(f.name, 200) || 'file';
    const file = sub.createFile(Utilities.newBlob(bytes, mime, fname));
    shareFile_(file);
    const id = file.getId();
    out.push({
      id: id,
      name: fname,
      type: mime,
      url: 'https://drive.google.com/file/d/' + id + '/view'
    });
  });
  return out;
}

function cell_(headers, row, name) {
  const i = headers.indexOf(name);
  return i >= 0 ? row[i] : '';
}

function rowToItem_(headers, r) {
  const ts = cell_(headers, r, 'timestamp');
  const date = ts instanceof Date ? ts.toISOString().slice(0, 10) : (ts ? String(ts).slice(0, 10) : '');
  const files = parseFiles_(cell_(headers, r, 'files')).map(function (f) {
    ensureFilePublic_(f);
    return publicFile_(f);
  });
  const item = {
    id: String(cell_(headers, r, 'id') || ''),
    date: date,
    name: cell_(headers, r, 'name'),
    relation: cell_(headers, r, 'relation'),
    memory: cell_(headers, r, 'memory'),
    links: cell_(headers, r, 'links') || '',
    files: files
  };
  if (cell_(headers, r, 'edited_at')) item.edited = true;
  return item;
}

function writeRow_(sh, headers, rowIndex, obj) {
  Object.keys(obj).forEach(function (k) {
    const c = col_(headers, k);
    if (c) sh.getRange(rowIndex, c).setValue(obj[k]);
  });
}

// Last row that has a timestamp in column A (ignores rows that only hold empty checkboxes).
function lastDataRow_(sh) {
  const n = sh.getLastRow();
  if (n < 1) return 0;
  const vals = sh.getRange(1, 1, n, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) {
    if (String(vals[i][0] || '').trim() !== '') return i + 1;
  }
  return 1;
}

function appendRowObj_(sh, headers, obj) {
  const rowIndex = lastDataRow_(sh) + 1;
  if (rowIndex > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), rowIndex - sh.getMaxRows());
  const values = headers.map(function (h) { return Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ''; });
  sh.getRange(rowIndex, 1, 1, values.length).setValues([values]);
  return rowIndex;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true });
    if (d.action === 'update') return update_(d, lock);
    return create_(d, lock);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function create_(d, lock) {
  const name = clip_(d.name, LIMITS.name).trim();
  const memory = clip_(d.memory, LIMITS.memory).trim();
  if (!name || !memory) return json_({ ok: false, error: 'missing fields' });
  const filesIn = Array.isArray(d.files) ? d.files.slice(0, MAX_FILES) : [];
  const storedFiles = filesIn.length ? uploadFiles_(filesIn, name) : [];
  const id = newId_();
  const token = newToken_();
  const now = new Date();
  lock.waitLock(20000);
  const sh = ensureSchema_();
  const headers = headerNames_(sh);
  const row = {
    timestamp: now,
    name: name,
    relation: clip_(d.relation, LIMITS.relation),
    memory: memory,
    links: clip_(d.links, LIMITS.links),
    email: clip_(d.email, LIMITS.email),
    files: JSON.stringify(storedFiles),
    approved: false,
    hidden: false,
    id: id,
    edit_token: token,
    edited_at: ''
  };
  const rowIndex = appendRowObj_(sh, headers, row);
  ['approved', 'hidden'].forEach(function (name) {
    const c = col_(headers, name);
    if (c) { try { sh.getRange(rowIndex, c).insertCheckboxes(); } catch (e) {} }
  });
  if (NOTIFY) {
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      'זיכרון חדש באתר של אבא: ' + name,
      name + (d.relation ? ' (' + d.relation + ')' : '') + '\n\n' + memory +
      '\n\nקבצים: ' + storedFiles.length +
      '\nהזיכרון מתפרסם מיד באתר. כדי להסתיר אותו, סמנו את העמודה hidden או מחקו את השורה:\n' +
      SpreadsheetApp.getActive().getUrl()
    );
  }
  return json_({
    ok: true,
    id: id,
    token: token,
    item: {
      id: id,
      date: now.toISOString().slice(0, 10),
      name: name,
      relation: row.relation,
      memory: memory,
      links: row.links,
      files: storedFiles.map(publicFile_),
      edited: false
    }
  });
}

function update_(d, lock) {
  const id = String(d.id || '').trim();
  const token = String(d.token || '').trim();
  if (!id || !token) return json_({ ok: false, error: 'missing token' });
  const name = clip_(d.name, LIMITS.name).trim();
  const memory = clip_(d.memory, LIMITS.memory).trim();
  if (!name || !memory) return json_({ ok: false, error: 'missing fields' });

  lock.waitLock(20000);
  const sh = ensureSchema_();
  const headers = headerNames_(sh);
  const idCol = headers.indexOf('id');
  const tokCol = headers.indexOf('edit_token');
  if (idCol < 0 || tokCol < 0) return json_({ ok: false, error: 'not configured' });

  const values = sh.getDataRange().getValues();
  let rowIndex = -1;
  let row = null;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol] || '') === id && String(values[i][tokCol] || '') !== '' && String(values[i][tokCol]) === token) {
      rowIndex = i + 1;
      row = values[i];
      break;
    }
  }
  if (rowIndex < 0) return json_({ ok: false, error: 'not found' });
  if (isHidden_(cell_(headers, row, 'hidden'))) return json_({ ok: false, error: 'not found' });

  let files = parseFiles_(cell_(headers, row, 'files'));
  const removeIds = Array.isArray(d.removeIds) ? d.removeIds.map(String) : [];
  if (removeIds.length) {
    files = files.filter(function (f) {
      if (removeIds.indexOf(String(f.id || '')) === -1) return true;
      try { DriveApp.getFileById(f.id).setTrashed(true); } catch (e) {}
      return false;
    });
  }
  const newFilesIn = Array.isArray(d.files) ? d.files.slice(0, MAX_FILES) : [];
  if (newFilesIn.length) files = files.concat(uploadFiles_(newFilesIn, name));

  const now = new Date();
  const updates = {
    name: name,
    relation: clip_(d.relation, LIMITS.relation),
    memory: memory,
    links: clip_(d.links, LIMITS.links),
    files: JSON.stringify(files),
    edited_at: now
  };
  if (d.email != null && String(d.email).trim() !== '') updates.email = clip_(d.email, LIMITS.email);
  writeRow_(sh, headers, rowIndex, updates);

  const ts = cell_(headers, row, 'timestamp');
  return json_({
    ok: true,
    id: id,
    item: {
      id: id,
      date: ts instanceof Date ? ts.toISOString().slice(0, 10) : (ts ? String(ts).slice(0, 10) : now.toISOString().slice(0, 10)),
      name: name,
      relation: updates.relation,
      memory: memory,
      links: updates.links,
      files: files.map(publicFile_),
      edited: true
    }
  });
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    const sh = ensureSchema_();
    const headers = headerNames_(sh);
    const hiddenIdx = headers.indexOf('hidden');
    const rows = sh.getDataRange().getValues().slice(1);
    const stamped = [];
    rows.forEach(function (r) {
      if (!r || !String(r.join('')).trim()) return;
      if (hiddenIdx >= 0 && isHidden_(r[hiddenIdx])) return;
      const name = String(cell_(headers, r, 'name') || '').trim();
      const memory = String(cell_(headers, r, 'memory') || '').trim();
      if (!name && !memory) return;
      const ts = cell_(headers, r, 'timestamp');
      const t = ts instanceof Date ? ts.getTime() : Date.parse(ts) || 0;
      stamped.push({ t: t, item: rowToItem_(headers, r) });
    });
    stamped.sort(function (a, b) { return b.t - a.t; });
    return json_({ ok: true, items: stamped.map(function (x) { return x.item; }) });
  }
  return json_({ ok: true });
}
