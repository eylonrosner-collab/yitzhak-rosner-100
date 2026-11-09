/**
 * ספר זיכרונות – יצחק רוזנר 100
 * Google Apps Script שמחובר לגיליון Google Sheets בחשבון של אילון.
 * - doPost: מקבל זיכרון + קבצים מהאתר, שומר שורה בגיליון ואת הקבצים בתיקייה פרטית ב-Drive.
 *           כל שורה נכנסת עם approved = FALSE (ממתינה לאישור).
 * - doGet?action=list: מחזיר לאתר רק את השורות שסומנו approved = TRUE (שם, קשר, טקסט – בלי אימייל ובלי קבצים).
 * הקבצים נשארים פרטיים ב-Drive של אילון; לא משותפים עם אף אחד.
 */
const SHEET_NAME = 'submissions';
const FOLDER_NAME = 'יצחק רוזנר 100 – קבצים מהאתר';
const MAX_TOTAL_MB = 25;
const NOTIFY = true; // שליחת מייל לאילון על כל פנייה חדשה

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['timestamp', 'name', 'relation', 'memory', 'links', 'email', 'files', 'approved']);
    sh.setFrozenRows(1);
  }
  const last = Math.max(sh.getMaxRows(), 2);
  sh.getRange(2, 8, last - 1, 1).insertCheckboxes();
  getFolder_();
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

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true });             // honeypot (spam bots)
    const name = clip_(d.name, 100).trim();
    const memory = clip_(d.memory, 10000).trim();
    if (!name || !memory) return json_({ ok: false, error: 'missing fields' });
    const files = Array.isArray(d.files) ? d.files.slice(0, 20) : [];
    let total = 0, urls = [];
    if (files.length) {
      const folder = getFolder_();
      const sub = folder.createFolder(new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + ' ' + name);
      files.forEach(f => {
        const bytes = Utilities.base64Decode(f.data || '');
        total += bytes.length;
        if (total > MAX_TOTAL_MB * 1048576) throw new Error('too large');
        const file = sub.createFile(Utilities.newBlob(bytes, clip_(f.type, 100) || 'application/octet-stream', clip_(f.name, 200) || 'file'));
        urls.push(file.getUrl());
      });
    }
    lock.waitLock(20000);
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    sh.appendRow([new Date(), name, clip_(d.relation, 100), memory, clip_(d.links, 1000), clip_(d.email, 200), urls.join('\n'), false]);
    sh.getRange(sh.getLastRow(), 8).insertCheckboxes();
    if (NOTIFY) {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'זיכרון חדש באתר של אבא: ' + name,
        name + (d.relation ? ' (' + d.relation + ')' : '') + '\n\n' + memory + '\n\nקבצים: ' + urls.length +
        '\nלאישור: סמנו V בעמודה approved בגיליון ' + SpreadsheetApp.getActive().getUrl());
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    const rows = sh.getDataRange().getValues().slice(1);
    const items = rows.filter(r => r[7] === true).map(r => ({
      date: r[0] instanceof Date ? r[0].toISOString().slice(0, 10) : '',
      name: r[1], relation: r[2], memory: r[3]
    }));
    return json_({ ok: true, items: items });
  }
  return json_({ ok: true });
}
