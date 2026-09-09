# Booking Mini — פרויקט מסכם "From Web to Database"

גרסה מוקטנת של booking.com: אתר להזמנת חדרים במלונות, בנוי מ‑

| שכבה | טכנולוגיה |
|------|-----------|
| מסד נתונים | PostgreSQL |
| שרת ו‑REST API | Node.js + Express |
| צד לקוח | React (Vite) + React Router |
| בדיקות API | Thunder Client |

הכל רץ על כתובת אחת: **http://127.0.0.1:8000**

---

## 1. התקנה והרצה

### מה צריך להיות מותקן

| | איך בודקים | מאיפה מתקינים |
|---|---|---|
| Node.js 18+ | `node --version` | https://nodejs.org |
| PostgreSQL | `psql --version` | https://www.postgresql.org/download/ |

### א. להוריד את הפרויקט

```bash
git clone https://github.com/danihadani/hotel-booking-project
cd hotel-booking-project
```

### ב. הכנת מסד הנתונים

יוצרים משתמש ומסד נתונים ריק:

```bash
# Mac / Linux
psql -U postgres -c "CREATE USER booking WITH PASSWORD 'booking';"
psql -U postgres -c "CREATE DATABASE booking OWNER booking;"
```

בווינדוס פותחים **SQL Shell (psql)** מתפריט ההתחלה, מתחברים כ‑`postgres`,
ומריצים את שתי השורות בלי החלק של `psql -U postgres -c` ובלי המרכאות.

### ג. השרת

```bash
cd server
cp .env.example .env       # בווינדוס:  copy .env.example .env
npm install
npx prisma migrate dev     # בונה את הטבלאות לפי prisma/schema.prisma
npm run seed               # ממלא 5 מלונות, 26 חדרים ו‑2 משתמשים לדוגמה
npm start
```

אם פרטי החיבור שלך ל‑PostgreSQL שונים (משתמש, סיסמה או פורט) — עורכים את
`DATABASE_URL` בקובץ `.env` לפני `npx prisma migrate dev`.

בדיקה שהכל עלה: לפתוח בדפדפן **http://127.0.0.1:8000/api/hotels** —
אמור להופיע JSON עם חמישה מלונות.

### ד. צד הלקוח

בטרמינל **שני** (השרת ממשיך לרוץ בראשון):

```bash
cd client
npm install
npm run build              # בונה את אתר ה‑React לתוך client/dist
```

עכשיו נכנסים ל‑**http://127.0.0.1:8000** — השרת מגיש גם את האתר וגם את ה‑API.

משתמש לדוגמה: `dana` / `123456`

### פיתוח (אופציונלי)

בזמן עבודה על ה‑React נוח יותר להריץ שני שרתים, כמו בפרויקטים של הקורס:

```bash
cd server && npm run dev     # פורט 8000
cd client && npm run dev     # פורט 5173, מעביר כל /api לפורט 8000
```

### פקודות שימושיות

| פקודה | מה היא עושה |
|-------|-------------|
| `npm start` | מריץ את השרת |
| `npm run dev` | מריץ את השרת ומרענן אותו אוטומטית בכל שינוי בקוד |
| `npm run seed` | מאפס את הנתונים וממלא מחדש נתוני דמו |
| `npx prisma migrate dev` | מחיל שינויים מ‑`schema.prisma` על מסד הנתונים |
| `npx prisma studio` | פותח ממשק בדפדפן לעיון בטבלאות |

---

## 2. מבנה הנתונים (Design)

```
users ─────┐
           └──< reservations >──┬── hotels
                                └── rooms ──> hotels
```

| טבלה | שדות |
|------|------|
| `users` | `id`, `username` (ייחודי), `password_hash`, `full_name`, `email`, `created_at` |
| `hotels` | `id`, `name`, `country`, `city`, `number_of_rooms`, `stars` (1–5) |
| `rooms` | `id`, `hotel_id` → hotels, `name`, `max_guests`, `price`, `size` |
| `reservations` | `id`, `user_id`, `hotel_id`, `room_id`, `guest_name`, `start_date`, `end_date`, `nights`, `price_per_night`, `total_price`, `created_at` |

הסכימה המלאה, כולל אילוצי `CHECK`, נמצאת ב‑[`server/src/schema.sql`](server/src/schema.sql).

**חוק החפיפה בין תאריכים** — חדר תפוס כאשר קיימת הזמנה שבה:

```
existing.start_date < requested.end_date  AND  existing.end_date > requested.start_date
```

כלומר מי שעוזבת ב‑10.3 ומי שנכנסת ב‑10.3 לא מתנגשות. אותה נוסחה בדיוק משמשת גם
את `/api/available_rooms/` וגם את בדיקת ההזמנה.

**מחיר סופי** = (מספר לילות × מחיר ללילה) + 18% מע״מ.

---

## 3. ה‑REST API

### הממשקים שהמטלה מבקשת (פתוחים, בלי צורך בהתחברות)

| # | Method | URL | קלט | פלט |
|---|--------|-----|-----|-----|
| 1 | POST | `/api/hotel/` | `{name, country, city, number_of_rooms, stars}` | `201` + `{id, name, country, city, number_of_rooms, stars}` |
| 2 | POST | `/api/room/` | `{hotel, name, max_guests, price, size}` | `201` + `{id, name, max_guests, price, size, hotel}` |
| 3 | GET | `/api/available_rooms/?start_date=&end_date=` | שני תאריכים | `200` + מערך חדרים, או המחרוזת `"No rooms found on these dates"` |

בכל קלט לא תקין מוחזר `400` עם `{"errors": [...]}`.
בבקשה מס' 2, השדה `hotel` הוא ה‑`id` של המלון במסד הנתונים.

### הממשקים שהאתר משתמש בהם

| Method | URL | דורש התחברות |
|--------|-----|--------------|
| POST | `/api/register` | לא |
| POST | `/api/login` | לא |
| POST | `/api/logout` | לא |
| GET | `/api/me` | לא |
| GET | `/api/hotels` | כן |
| GET | `/api/hotels/:id` | כן |
| GET | `/api/rooms` | כן |
| GET | `/api/rooms/:id` | כן |
| POST | `/api/reservations` | כן |
| GET | `/api/reservations/:id` | כן |

### בדיקה ב‑Thunder Client

בקובץ [`thunder-collection_booking-mini.json`](thunder-collection_booking-mini.json)
יש אוסף מוכן של 16 בקשות, כולל בדיקת סטטוס אוטומטית לכל אחת.
ב‑VS Code: Thunder Client → Collections → תפריט ⋯ → **Import** → לבחור את הקובץ.

---

## 4. הדפים באתר

| נתיב | מה יש בו |
|------|----------|
| `/` | דף הבית: כותרת, תמונת ים ושקיעה, קישורי "הרשם" ו"מלונות" |
| `/register` | טופס רישום משתמש/ת חדש/ה |
| `/login` | כניסה |
| `/hotels` | רשימת כל המלונות |
| `/hotels/:id` | פרטי מלון: שם, כוכבים, ארץ, עיר, מספר סידורי, מספר חדרים ורשימת החדרים |
| `/rooms/:id` | פרטי חדר: שם, מספר סידורי, מקסימום אורחים, מחיר ללילה, גודל + "הזמן עכשיו" |
| `/book` | טופס הזמנה |
| `/reservation/:id` | אישור הזמנה עם מספר ההזמנה והמחיר הסופי |
| `/unavaliable_room` | שגיאה: החדר תפוס בתאריכים המבוקשים |
| `/invalid_room` | שגיאה: החדר אינו שייך למלון שנבחר |
| `/invalid_dates` | שגיאה: התאריכים אינם תקינים |

משתמשת שאינה מחוברת מופנית אוטומטית ל‑`/login` בכל ניסיון להיכנס לדף מוגן,
והשרת חוסם את אותן בקשות גם ישירות (`401`) — כך שהחסימה אמיתית ולא רק בממשק.

---

## 5. בדיקת קלט

כל קלט נבדק **פעמיים** — פעם בדפדפן כדי לתת תשובה מיידית, ופעם בשרת כי רק הוא
באמת קובע:

| שדה | הכלל |
|------|------|
| `stars` | מספר שלם בין 1 ל‑5 |
| `number_of_rooms`, `size`, `max_guests` | מספר שלם חיובי |
| `price` | מספר גדול מ‑0 |
| `name`, `country`, `city` | מחרוזת לא ריקה |
| `username` | 3–50 תווים: אותיות באנגלית, ספרות, `.` `_` `-`, וייחודי |
| `password` | לפחות 6 תווים, נשמר מוצפן (bcrypt) |
| `email` | פורמט אימייל תקין |
| תאריכים | פורמט `YYYY-MM-DD`, תאריך אמיתי (`2026-02-31` נדחה), ותאריך עזיבה אחרי תאריך כניסה |

---

## 6. מבנה הקבצים

```
booking/
├── server/
│   ├── src/
│   │   ├── index.js              נקודת הכניסה: Express, session, הגשת ה‑React
│   │   ├── db.js                 חיבור ל‑PostgreSQL
│   │   ├── schema.sql            הגדרת הטבלאות
│   │   ├── initdb.js             יצירת הטבלאות
│   │   ├── seed.js               נתוני דוגמה
│   │   ├── middleware/auth.js    חסימת דפים למי שאינה מחוברת
│   │   ├── routes/
│   │   │   ├── api.js            שלושת ה‑API של המטלה
│   │   │   ├── auth.js           רישום, כניסה, יציאה
│   │   │   ├── catalog.js        מלונות וחדרים
│   │   │   └── reservations.js   ביצוע הזמנה ובדיקת פנויות
│   │   └── utils/
│   │       ├── validate.js       כל בדיקות הקלט
│   │       └── format.js         עיצוב ה‑JSON וחישוב המחיר
│   └── package.json
├── client/
│   ├── src/
│   │   ├── main.jsx, App.jsx     ניתוב בין הדפים
│   │   ├── api.js                קריאות לשרת
│   │   ├── auth.jsx              מי מחוברת כרגע
│   │   ├── styles.css
│   │   ├── components/           Hero (ים ושקיעה), Stars, ErrorPage
│   │   └── pages/                כל הדפים
│   └── package.json
├── thunder-collection_booking-mini.json
└── README.md
```
