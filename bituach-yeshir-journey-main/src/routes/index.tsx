import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Video,
  Phone,
  Handshake,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ביטוח ישיר – הצעד הבא במסלול שלך" },
      {
        name: "description",
        content: "סיימת את הראיון האוטומטי. אנחנו ניצור איתך קשר בקרוב לתיאום הראיון הפרונטלי.",
      },
    ],
  }),
  component: Index,
});

const stages = [
  { icon: Video, title: "ראיון אוטומטי" },
  { icon: Phone, title: "שיחה לתיאום ראיון" },
  { icon: Handshake, title: "ראיון פרונטלי" },
  { icon: GraduationCap, title: "קורס הכשרה" },
  { icon: Briefcase, title: "תחילת עבודה" },
];

function Index() {
  const currentStage = 1; // ממתין/ה לשיחה
  const [progress, setProgress] = useState(0);
  const target = Math.round(((currentStage + 0.5) / stages.length) * 100);

  useEffect(() => {
    const t = setTimeout(() => setProgress(target), 250);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-soft">
      {/* Top bar with logo */}
      <header className="px-6 py-5 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img src={logoImg} alt="ביטוח ישיר" className="h-10 w-auto" />
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            מסלול גיוס
          </span>
        </div>
      </header>

      <main className="px-6 py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Status badge */}
          <div className="flex justify-center mb-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary-deep text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-success" />
              הראיון האוטומטי הושלם בהצלחה
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: "80ms" }}>
            <h1 className="text-3xl md:text-5xl font-extrabold text-primary-deep leading-tight mb-3">
              עבודה יפה!
              <br />
              <span className="text-accent-yellow">אנחנו ניצור איתך קשר.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              נציג/ה תתקשר אלייך בימים הקרובים לתיאום ראיון פרונטלי.
            </p>
          </div>

          {/* Current stage card */}
          <div
            className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-border mb-8 animate-slide-up"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-step animate-pulse-ring">
                  <Phone className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-accent-yellow mb-0.5">השלב הנוכחי</div>
                <h2 className="text-xl font-extrabold text-primary-deep">ממתינ/ה לשיחת טלפון</h2>
                <div className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-primary bg-accent px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  עד 3 ימי עסקים
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-primary-deep">את כבר ב-{progress}% מהדרך</span>
                <span className="text-muted-foreground">
                  שלב {currentStage + 1} / {stages.length}
                </span>
              </div>
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-progress rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compact timeline */}
          <div
            className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-border mb-8 animate-slide-up"
            style={{ animationDelay: "240ms" }}
          >
            <ol className="space-y-1">
              {stages.map((s, i) => {
                const status =
                  i < currentStage ? "done" : i === currentStage ? "current" : "upcoming";
                const Icon = s.icon;
                return (
                  <li key={s.title} className="flex items-center gap-4 py-2.5">
                    <div
                      className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-smooth ${
                        status === "done"
                          ? "bg-success text-success-foreground"
                          : status === "current"
                            ? "bg-accent-yellow text-primary-deep shadow-step"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status === "done" ? (
                        <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span
                        className={`font-bold text-sm md:text-base ${
                          status === "upcoming" ? "text-muted-foreground" : "text-primary-deep"
                        }`}
                      >
                        {s.title}
                      </span>
                      {status === "current" && (
                        <span className="text-xs font-bold text-accent-yellow">כעת</span>
                      )}
                      {status === "done" && (
                        <span className="text-xs font-semibold text-success">הושלם</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Encouragement */}
          <div
            className="text-center animate-slide-up"
            style={{ animationDelay: "320ms" }}
          >
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent-yellow" />
              <span>94% מהמועמדים שהגיעו לכאן ממשיכים עד הסוף</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-6 text-center">
        <img src={logoImg} alt="ביטוח ישיר" className="h-7 w-auto mx-auto opacity-60" />
      </footer>
    </div>
  );
}
