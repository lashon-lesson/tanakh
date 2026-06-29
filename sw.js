
const CACHE_NAME = 'tanakh-v2';
const BASE = '/tanakh/';
 
// קבצים לשמירה במטמון לשימוש offline
// כרגע נשמרת רק מעטפת האפליקציה (index + manifest), כי קובצי השיעורים עדיין לא קיימים.
// cache.addAll הוא אטומי — קובץ אחד חסר (404) מפיל את כל ההתקנה. לכן מוסיפים שיעורים רק
// כשהם קיימים בפועל, ומעלים אז את גרסת ה-CACHE_NAME (tanakh-v2 וכו') כדי לרענן את המטמון.
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  // גופנים
  'https://fonts.googleapis.com/css2?family=Secular+One&family=Heebo:wght@300;400;500;600;700;800;900&display=swap'
];
 
// התקנה — שמירת קבצים במטמון
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE.filter(u => !u.startsWith('http'))))
      .then(() => self.skipWaiting())
  );
});
 
// הפעלה — מחיקת מטמון ישן
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
 
// בקשות — network first, אחר כך cache
self.addEventListener('fetch', event => {
  // לא מטפלים בבקשות Firebase
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com/identitytoolkit')) {
    return;
  }
 
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // שמירה במטמון של תגובות מוצלחות
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // אם אין רשת — החזר מהמטמון
        return caches.match(event.request)
          .then(cached => cached || caches.match(BASE + 'index.html'));
      })
  );
});
 
