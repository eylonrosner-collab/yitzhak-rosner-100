# מדריך תרומה לאתר יצחק רוזנר · 100

אתר לזכרו של יצחק (ז׳אק) רוזנר, לציון 100 שנה להולדתו (25.11.1926–25.11.2026): קורות חייו, ציר זמן עם מסמכים, סיפורים שכתב, עדות, עץ משפחה, תמונות וספר זיכרונות.

- מאגר: [eylonrosner-collab/yitzhak-rosner-100](https://github.com/eylonrosner-collab/yitzhak-rosner-100)
- אתר חי (GitHub Pages, ענף `main`): [https://eylonrosner-collab.github.io/yitzhak-rosner-100/](https://eylonrosner-collab.github.io/yitzhak-rosner-100/)
- שפות: עברית (ברירת המחדל, והטקסט שנמצא בקובצי התוכן), אנגלית (`?lang=en`) וצרפתית (`?lang=fr`)

האתר סטטי: HTML, CSS, JavaScript וקבצי JSON. אין שרת משלו מלבד ספר הזיכרונות, שרץ ב-Google Apps Script ומחובר לגיליון של אילון.

---

## מפת התיקיות והקבצים

רק מה שבאמת נמצא במאגר:

| נתיב | מה יש בו |
|---|---|
| `index.html` | העמוד הראשי: קורות חיים, ציר זמן, סיפורים, עדות 2009, הקלטה 2016, עץ משפחה, מסמכים, תמונות, ספר זיכרונות |
| `history.html` | עמוד «רקע היסטורי: יהודי רומניה ובוקובינה» — HTML סטטי עם מפתחות `data-i18n` / `data-i18n-html` |
| `css/style.css` | עיצוב האתר |
| `js/app.js` | טעינת ציר הזמן, סיפורים, מסמכים, גלריה, ספר הזיכרונות וחלון תרגום המסמכים |
| `js/i18n.js` | מחליף השפה (עב / EN / FR). מפתחות חסרים חוזרים לעברית |
| `js/tree.js` | עץ המשפחה: מערך `PEOPLE` מובנה בקובץ |
| `config.js` | `SITE_CONFIG.MEMORIES_ENDPOINT` (כתובת ה-Web App של Apps Script) ו-`MAX_UPLOAD_MB` (כרגע 25). **אין לשנות בלי תיאום עם אילון**, ואין להעתיק את הכתובת למקומות אחרים |
| `data/timeline.json` | אירועי ציר הזמן האישיים (41 אירועים) |
| `data/timeline_context.json` | אירועי רקע היסטורי (30 אירועים, מוצגים רק כשמסמנים «הצג אירועי רקע היסטורי») |
| `data/i18n/en.json`, `data/i18n/fr.json` | תרגומי ממשק ותוכן לאנגלית ולצרפתית |
| `data/documents.json` | התעודות בפרק «מסמכים ותעודות» (שדה `tr` רשות: מזהי תרגום לכפתור) |
| `data/album.json` | כרטיסי הכיתוב והתמונות בפרק «מהאלבום המשפחתי» (EN/FR במפתחות `album.{id}.title` / `album.{id}.text`) |
| `data/doc_translations.json` | תמלול ותרגום של סריקות שמוצגים בחלון קופץ מציר הזמן ומפרק המסמכים. רשומה יכולה לכלול `meta` עם `btn` / `title` / `orig` / `pages` בשלוש השפות ו-`lang` של המקור, ואז אין צורך במפתחות `doc.{id}.tr.*` |
| `data/stories.json` | כרטיסי הסיפורים (קישור לדפי `stories/*.html`) |
| `data/gallery.json` | פריטי הגלריה |
| `data/memories.json` | מערך ריק `[]` — גיבוי סטטי בלבד; הזיכרונות החיים לא נשמרים כאן |
| `data/testimony_part1.html`, `data/testimony_part2.html` | התמלולים שמוצגים באתר תחת סרטוני העדות |
| `data/transcript_edited_part1.md`, `data/transcript_edited_part2.md` | מקור העבודה של אותם תמלולים (Markdown). אם משנים ניסוח — לעדכן גם את ה-HTML וגם את ה-Markdown |
| `data/recording2016.html`, `data/recording2016_transcript_edited.md` | תמלול ההקלטה מ-2016 (HTML באתר, Markdown כמקור) |
| `stories/` | דפי הסיפורים (`maccabi`, `leo`, `shargorod`, `shargorod-en`, `conversation`, `boico`, `boker`, `haver`) והעתקי PDF ב-`stories/pdf/` |
| `img/docs/` | סריקות התעודות, כל עמוד כקובץ מלא וכתמונה ממוזערת עם הסיומת `-t.jpg` |
| `img/g/` ו-`img/t/` | תמונות הגלריה במלואן (`img/g/`) והממוזערות התואמות (`img/t/`) |
| `img/hist/` | תמונות עמוד הרקע ההיסטורי (קובץ מלא + `-t.jpg`) |
| `img/hero.jpg` | תמונת הכותרת |
| `audio/aba_sipur_yeladut_shoah_2016-05-06.mp3` | ההקלטה הביתית מ-6.5.2016 |
| `backend/Code.gs`, `backend/README.md` | סקריפט ספר הזיכרונות והוראות הפריסה. **אין לערוך או לפרוס מחדש בלי תיאום עם אילון** |
| `.nojekyll` | מונע מ-GitHub Pages להריץ Jekyll על האתר |

### שדות ב-`data/timeline.json`

כל אירוע הוא אובייקט עם:

- `id` — מזהה ייחודי וגם עוגן בכתובת (`#e10`). המספרים אינם לפי סדר כרונולוגי (למשל נוספו גם `e35`–`e41`). המזהה הפנוי הבא אחרי הגבוה ביותר הקיים (`e41`) הוא `e42`, אבל אל תמחזר מזהה קיים.
- `date` — המחרוזת שמוצגת מעל הכותרת (למשל `"15.7–15.10.1944"` או `"קיץ 1934 (או 1935)"`).
- `year` — מספר למיון בלבד (מותר גם שבר, למשל `1944.5`). העמוד ממיין לפי שדה זה, לא לפי סדר האירועים בקובץ.
- `title`, `text` — כותרת וגוף בעברית (זו שפת המקור).
- `sources` — מערך מקורות. **לכל אירוע צריך להיות לפחות מקור אחד.**
- `note` (רשות) — הערה שמופיעה מתחת לגוף. כברירת מחדל מתווספת לפניה המילה «לבדיקה». אם ההערה אינפורמטיבית בלבד, מוסיפים גם `"check": false` (כמו באירוע `e07`) והקידומת לא תופיע.
- `translateDoc` (רשות) — מזהה, או מערך מזהים, ב-`data/doc_translations.json` שפותח כפתור תרגום בחלון קופץ (`"dep"` ב-`e07`, `["tr","spr"]` ב-`e10`).

שדות בכל פריט ב-`sources`:

| `type` | מה הוא מציג | `src` | `thumb` |
|---|---|---|---|
| `image` | תמונה/סריקה שנפתחת בהגדלה | נתיב לקובץ המלא, למשל `img/docs/…-page-1.jpg` או `img/g/…jpg` | נתיב לממוזערת (`img/docs/…-t.jpg` או `img/t/…jpg`) |
| `story` | קישור לסיפור באתר | למשל `stories/conversation.html` | — |
| `video` | קישור לסרטון (בדרך כלל יוטיוב, אפשר עם `?t=` לשעה מדויקת) | כתובת מלאה | — |
| `link` | קישור חיצוני | כתובת מלאה | — |
| `anchor` | קפיצה לפרק באותו עמוד | למשל `#testimony` או `#recording2016` | — |

לכל מקור יש גם `label` — הכיתוב שמופיע ליד הקישור או מתחת לתמונה.

אירועי הרקע ב-`data/timeline_context.json` נראים אותו דבר, בתוספת `"context": true` ומזהים בסגנון `c01`.

### תרגומים (`data/i18n/en.json` ו-`fr.json`)

העברית חיה בקבצי התוכן עצמם (`timeline.json`, `documents.json`, `index.html`, `history.html`, `js/tree.js` וכו׳). קובצי ה-i18n מחזיקים רק EN ו-FR. מפתח חסר חוזר אוטומטית לטקסט העברי.

דפוסי מפתחות שכבר בשימוש:

- ציר זמן אישי: `tl.{id}.title`, `tl.{id}.text`, `tl.{id}.date` (אם צריך לתרגם את התאריך), `tl.{id}.note`, `tl.{id}.src.0`, `tl.{id}.src.1`… (לפי סדר המקורות)
- אירועי רקע: אותם שדות עם קידומת `ctx.{id}.…`
- מסמכים בפרק המסמכים: `doc.{id}.title`, `doc.{id}.caption`, `doc.{id}.lang`, `doc.{id}.img.0`…
- כפתור וחלון תרגום הסריקה: `doc.{id}.tr.btn`, `doc.{id}.tr.title`, `doc.{id}.tr.orig`, `doc.{id}.tr.scan`, `doc.{id}.tr.page1`, `doc.{id}.tr.close` (ו-`page2` אם יש יותר מעמוד אחד)
- סיפורים: `story.{id}.title`, `.period`, `.summary`, `.author` (ו-`story.{id}.long` לסיכום ארוך בדף הסיפור)
- גלריה: `gallery.{id}` לפי ה-`id` שב-`gallery.json`, ותקופות ב-`gallery.period.1` עד `gallery.period.5`
- עץ משפחה: `tree.{id}.name`, `.dates`, `.role`, `.detail`
- עמוד הרקע ההיסטורי: מפתחות `history.*` שתואמים ל-`data-i18n` / `data-i18n-html` ב-`history.html`
- ממשק כללי: `nav.*`, `sec.*`, `bio.*`, `hero.*`, `mem.*`, `ui.*` וכו׳, לפי המאפיינים ב-`index.html`

### מסמכים, תמונות, עדות, היסטוריה

**מסמכים.** התעודות מוגדרות ב-`data/documents.json`. לפני פרסום סריקה משחירים מספרי זהות ישראליים, סדרות ומספרי תעודות זהות רומניות ומספרי תיק גרמניים. כתובות במסמכים ובטקסטים מותר לפרסם (לפי החלטת אילון, 14.11.2026), למעט מקום מגוריה הנוכחי של רות. בתעודת הנישואין מוסתר גם תאריך הלידה של רות, ובתעודת הפטירה הוסר חלק הנמען עד להחלטת אילון. את תעודת הלידה של רות לא מפרסמים. כל רשומה כוללת `id`, `name` (של התיקייה/הסלאג), `pages`, `title`, `date`, `lang`, `caption` ומערך `images` עם `src`, `thumb`, `label`. הקבצים עצמם ב-`img/docs/`, בשמות כמו `adeverinta-traducator-frontul-2-ucrainian-1946-page-1.jpg` והממוזערת `…-page-1-t.jpg`.

**תמונות.** הגלריה נטענת מ-`data/gallery.json`: `id`, `full` (`img/g/…`), `thumb` (`img/t/…`), `caption`, `period`, וגם `source` / `w` / `h`. כפתור «לאלבום התמונות המלא» נמצא ב-`index.html` ומצביע לאלבום Google Photos.

**עדות ותמלולים.** באתר נטענים `data/testimony_part1.html` ו-`data/testimony_part2.html` (ו-`data/recording2016.html` להקלטה). קובצי ה-`.md` המקבילים הם מקור העריכה. בעדות: `[לא ברור]` לקטע שלא זוהה, `[מילה?]` להשערה.

**רקע היסטורי.** התוכן העברי כתוב ב-`history.html`; התרגומים במפתחות `history.*`. התמונות ב-`img/hist/`. אירועי הרקע שמופיעים בציר הזמן (באפור) מגיעים מ-`data/timeline_context.json`.

**עץ המשפחה.** האנשים מוגדרים במערך `PEOPLE` שב-`js/tree.js`. למי ש-`living` הוא `true` מוצג השם בלבד — בלי תאריכים ובלי פרטי מגורים.

---

## איך מוסיפים אירוע בציר הזמן עם מסמך מקור

1. **הכניסו את הסריקה** ל-`img/docs/`, גם בגודל מלא וגם כממוזערת (`-t.jpg`). שמרו על דפוס השמות הקיים: `{slug}-page-N.jpg` ו-`{slug}-page-N-t.jpg`.
2. **אם התעודה צריכה להופיע גם בפרק «מסמכים ותעודות»**, הוסיפו רשומה ב-`data/documents.json` (העתיקו רשומה קיימת ושנו את השדות) ואת מפתחות `doc.{id}.*` ב-`en.json` וב-`fr.json`.
3. **הוסיפו את האירוע** ל-`data/timeline.json` בתוך מערך `events`. המיקום בקובץ לא קובע את הסדר בתצוגה — השדה `year` קובע. בחרו `id` שלא בשימוש.
4. **ציינו מקור.** לסריקה השתמשו ב-`type: "image"` עם `src` ו-`thumb`. אפשר להוסיף גם `story`, `video`, `link` או `anchor`.
5. **הוסיפו תרגומי EN/FR** ב-`data/i18n/en.json` וב-`data/i18n/fr.json` (ראו למטה). בלי המפתחות האלה, באנגלית ובצרפתית יופיע הטקסט העברי.
6. **חלון תרגום לסריקה (רשות).** אם רוצים כפתור כמו ב-`e07` / `e10`: הוסיפו `"translateDoc": "{id}"` לאירוע, רשומה ב-`data/doc_translations.json` (תמלול מקור + `tr.he` / `tr.en` / `tr.fr` + קישור לסריקה), ומפתחות `doc.{id}.tr.*` בשני קובצי ה-i18n. קראו את הסריקה עצמה; אל תמציאו תוכן; סמנו קטע לא קריא כ-`[לא קריא]` ושדה ריק כ-`____`. אם המסמך ברוסית או ברומנית — תמללו בכתב המקור.
7. **בדקו שה-JSON תקין** (פסיק מיותר בסוף אובייקט ישבור את העמוד). אחר כך commit, push, והמתינו לפריסת Pages.

דוגמה אמיתית — האירוע `e10` כפי שהוא ב-`data/timeline.json`:

```json
{
  "date": "15.7–15.10.1944",
  "year": 1944.5,
  "title": "מתורגמן בחזית האוקראינית השנייה",
  "text": "בבוטושאני התקבל כמתורגמן במפקדה הרוסית שניהלה את הטריטוריה הרומנית. את הרוסית לימד את עצמו, מספרים ומילון רוסי־גרמני. אישור רשמי מ־1946 מעיד על השירות.",
  "sources": [
    {
      "type": "image",
      "label": "אישור השירות כמתרגם (תרגום מרוסית, בוקרשט 1946)",
      "src": "img/docs/adeverinta-traducator-frontul-2-ucrainian-1946-page-1.jpg",
      "thumb": "img/docs/adeverinta-traducator-frontul-2-ucrainian-1946-page-1-t.jpg"
    },
    {
      "type": "story",
      "label": "שיחה על שרגורוד",
      "src": "stories/conversation.html"
    },
    {
      "type": "video",
      "label": "עדות 2009, חלק ב׳ 11:37 – מתורגמן בצבא האדום",
      "src": "https://youtu.be/WQ14GO9kM6o?t=697"
    }
  ],
  "id": "e10",
  "translateDoc": "tr"
}
```

המפתחות המתאימים ב-`data/i18n/en.json` (ובמקביל ב-`fr.json`):

```json
"tl.e10.title": "Interpreter with the Second Ukrainian Front",
"tl.e10.text": "In Botoșani he was taken on as an interpreter…",
"tl.e10.src.0": "Certificate of service as a translator (translated from Russian, Bucharest 1946)",
"tl.e10.src.1": "A conversation about Shargorod",
"tl.e10.src.2": "2009 testimony, part 2 11:37 – interpreter in the Red Army"
```

(את נוסח `tl.e10.text` המלא יש להעתיק מהקובץ עצמו, לא לקצר אותו באתר.) לחלון התרגום של אותו מסמך קיימים גם `doc.tr.tr.btn` (`Translation` / `Traduction`), `doc.tr.tr.title`, `doc.tr.tr.orig`, `doc.tr.tr.scan`, `doc.tr.tr.page1` ו-`doc.tr.tr.close`. בעברית הכיתוב של הכפתור (`תרגום המסמך` או `תרגום התעודה`) מגיע מפתח i18n אם קיים, ואחרת ממילון ברירת מחדל ב-`js/app.js`.

---

## איך לערוך: ממשק GitHub או מחשב מקומי

אפשר לערוך ישירות באתר GitHub או אחרי שכפול המאגר למחשב. בשני המקרים דוחפים לענף `main`. גם העוזר של אילון דוחף ל-`main`, לכן חשוב למשוך את הגרסה העדכנית לפני כל דחיפה — אחרת עלולים לדרוס זה את זה או ליצור התנגשות.

### בממשק GitHub (בלי Git מקומי)

1. פתחו את הקובץ במאגר, למשל `data/timeline.json`.
2. לחצו על סמל העיפרון (Edit this file).
3. ערכו, ושמרו על JSON תקין.
4. בתחתית העמוד כתבו הודעת commit ברורה (מה שיניתם ולמה) ושמרו ישירות ל-`main`.
5. המתינו דקה–שתיים ובדקו את העמוד החי ואת לשונית Actions.

מתאים לתיקון קצר בטקסט או להוספת מפתח תרגום. להוספת תמונות נוח יותר לעבוד מקומית.

### במחשב מקומי

```bash
git clone https://github.com/eylonrosner-collab/yitzhak-rosner-100.git
cd yitzhak-rosner-100
git pull origin main          # תמיד, לפני שמתחילים לערוך ולפני כל push
```

אפשר לצפות באתר מקומית (הוא סטטי):

```bash
python3 -m http.server 8000
```

ואז לפתוח `http://localhost:8000/`. אחרי העריכה:

```bash
git pull origin main          # שוב, למקרה שנדחפו שינויים בזמן העבודה
git add data/timeline.json data/i18n/en.json data/i18n/fr.json   # רק את הקבצים שנגעתם בהם
git status                    # ודאו שלא נכנסו קבצים לא קשורים
git commit -m "תיאור קצר וברור של השינוי"
git push origin main
```

אם `git pull` מדווח על התנגשות — יישבו אותה בזהירות, בלי למחוק שינויים של אחרים, ורק אז דחפו.

---

## פרסום ב-GitHub Pages

כל דחיפה ל-`main` מפעילה את תהליך `pages build and deployment`. בדרך כלל זה אורך דקה–שתיים. את הסטטוס רואים בלשונית [Actions](https://github.com/eylonrosner-collab/yitzhak-rosner-100/actions) במאגר. רק אחרי שהריצה מסתיימת בהצלחה כדאי לרענן את האתר החי ולבדוק גם בעברית וגם באנגלית (`?lang=en`) אם נגעתם בתרגומים.

---

## ספר הזיכרונות

הזיכרונות החיים נשמרים בגיליון Google Sheets שבבעלות אילון, **לא במאגר**. `data/memories.json` הוא מערך ריק שמשמש רק כגיבוי סטטי; האתר טוען את הרשימה מה-Web App שמוגדר ב-`config.js`.

- אל תערכו את `backend/Code.gs` ואל תפרסו מחדש את ה-Apps Script בלי לתאם עם אילון.
- הפריסה נעשית מתוך עורך ה-Apps Script (Deploy ← Manage deployments ← גרסה חדשה לאותו URL קיים). הגרסה הפעילה היא **גרסה 6**, בכתובת הקיימת.
- פירוט טכני למפעיל נמצא ב-`backend/README.md`. אין להכניס למאגר קישורי עריכה לגיליון, אסימונים או כתובות דוא״ל.

---

## כללי תוכן

- **אל תמציאו עובדות.** אם משהו לא ודאי — סמנו זאת (הערת `note`, `[לא ברור]`, `[לא קריא]`, ניסוח זהיר), ואל תשלימו פרטים «הגיוניים».
- **לכל אירוע בציר הזמן צריך מקור** — תעודה, תמונה, סיפור שכתב, רגע בעדות, או קישור למקור חיצוני.
- **תרגום סריקות:** קראו את הסריקה עצמה. אל תמציאו מילים. קטע לא קריא: `[לא קריא]`. שדה ריק בטופס: `____`. מסמך ברוסית או ברומנית — תמלול בכתב המקור, כולל שגיאות הקלדה כפי שהן כתובות.
- **בני משפחה בחיים — שם בלבד.** כך גם כתוב באתר («לבני משפחה בחיים מוצגים רק שמות»), וכך בנוי `js/tree.js` (`living: true` בלי תאריכים). אין להוסיף תאריכי לידה, כתובות מגורים נוכחיות, מקומות עבודה או פרטים מזהים אחרים. כתובות היסטוריות שמופיעות במסמכים ובאלבום מותר לפרסם.
- **אין לפרסם את מקום מגוריה הנוכחי של רות.** כתובות היסטוריות (למשל בתעודת הנישואין מ־1973) מותרות.
- **כתובות אינן מושחרות.** משחירים רק מספרי זהות, סדרות תעודות זהות רומניות ומספרי תיק גרמניים.

---

# Contributing — English summary

This is a static memorial site for Yitzhak (Jacques) Rosner, published from the `main` branch to [https://eylonrosner-collab.github.io/yitzhak-rosner-100/](https://eylonrosner-collab.github.io/yitzhak-rosner-100/). Hebrew is the source language in the content files; English and French live in `data/i18n/en.json` and `data/i18n/fr.json` and fall back to Hebrew when a key is missing.

To add a timeline event with a source document: put the scan (and a `-t.jpg` thumb) in `img/docs/`, add an event object to `data/timeline.json` (see `e10` in the Hebrew section — that is a real entry), give it at least one `sources` item, and add matching `tl.{id}.*` keys in both i18n files. Optional: list the document in `data/documents.json`, and/or add a translation modal via `translateDoc` + `data/doc_translations.json`. Do not invent facts; every event needs a source; mark unreadable scan text as `[לא קריא]` and blank fields as `____`.

You can edit in the GitHub web UI (pencil icon, commit to `main`) or locally. Eylon’s assistant also pushes to `main`, so always `git pull origin main` before you start and again before every `git push`. GitHub Pages usually updates in 1–2 minutes; check the Actions tab for `pages build and deployment`.

Memories are stored in a Google Sheet owned by Eylon, not in this repo. Do not edit `backend/Code.gs` or redeploy the Apps Script without coordinating with him (current deployment: version 6 at the existing URL). Do not change `config.js` without coordinating either. Living relatives are listed by name only; do not publish Ruth’s current place of residence. Addresses are not redacted (Eylon’s decision, 14.11.2026): black out only Israeli ID numbers, Romanian identity-card series/numbers and German file numbers. Ruth’s birth date on the marriage certificate stays hidden, her birth certificate stays unpublished, and the death certificate’s addressee section stays cropped pending Eylon’s decision.
