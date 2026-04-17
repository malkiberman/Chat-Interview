# ScreenAI Client

קליינט React (Vite) שמחולק לשני פורטלים:

1. פורטל מועמד:
   - `/` טופס פרטים קצר
   - `/interview` ראיון צ'אט ושמירת תשובות לשרת

2. פורטל מגייס:
   - `/dashboard` רשימת מועמדים + פילטרים
   - `/candidate/:id` ניתוח מלא למועמד

הפרדה בין הפורטלים מבוססת `sessionStorage` (באותה לשונית אין מעבר ממועמד למגייס ולהפך).

## הפעלה

```bash
npm install
npm run dev
```

## קונפיגורציית API

הקליינט מדבר עם השרת דרך `VITE_API_URL`.

- ברירת מחדל: `http://localhost:3000/api`
- דוגמה:

```powershell
$env:VITE_API_URL="http://localhost:3000/api"
```
