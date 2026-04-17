import { useEffect, useRef, useState } from 'react';
import { interviewIntro, interviewQuestions } from '../config/interviewQuestions';
import { submitInterview } from '../services/api';
import { useSpeechRecorder } from '../hooks/useSpeechRecorder';

const DONE_MESSAGE = 'תודה רבה 🙏 הראיון נשמר בהצלחה ונחזור אליך בהקדם.';

export default function ChatInterview({ onConversationEnd, candidateInfo }) {
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const bottomRef = useRef(null);

  const {
    isRecording,
    transcript,
    interim,
    supported,
    error: recError,
    start,
    stop,
    reset,
  } = useSpeechRecorder('he-IL');

  useEffect(() => {
    setMessages([{ from: 'bot', text: interviewIntro }, { from: 'bot', text: interviewQuestions[0].text }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interim]);

  useEffect(() => {
    if (isRecording) {
      setInput(`${transcript}${interim ? ` ${interim}` : ''}`.trim());
    }
  }, [transcript, interim, isRecording]);

  function pushBot(text) {
    setMessages((prev) => [...prev, { from: 'bot', text }]);
  }

  async function finishInterview(finalAnswers) {
    const candidateId = candidateInfo?.email || candidateInfo?.fullName || `candidate-${Date.now()}`;
    
    const payload = {
      candidateId,
      candidate: {
        fullName: candidateInfo?.fullName || '',
        email: candidateInfo?.email || '',
        phone: candidateInfo?.phone || '',
      },
      answers: finalAnswers.map((a) => a.answer),
    };

    console.log('🎤 [ראיון מסתיים] שליחה לשרת:');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    setSubmitting(true);
    setSubmitError('');

    try {
      console.log('⏳ שליחה לשרת...');
      const savedCandidate = await submitInterview(payload);
      console.log('✅ התגובה מהשרת:', savedCandidate);
      pushBot(DONE_MESSAGE);
      onConversationEnd?.(savedCandidate);
    } catch (error) {
      console.error('❌ שגיאה בשלח הראיון:', error);
      setSubmitError('לא הצלחנו לשמור את הראיון כרגע. נסה/י שוב בעוד כמה דקות.');
    } finally {
      setSubmitting(false);
    }
  }

  function submitAnswer(text) {
    const trimmed = text.trim();
    if (!trimmed || done) return;

    const activeQuestion = interviewQuestions[currentIndex];
    const newAnswers = [
      ...answers,
      { questionId: activeQuestion.id, question: activeQuestion.text, answer: trimmed },
    ];

    setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
    setAnswers(newAnswers);
    setInput('');
    reset();

    const nextIndex = currentIndex + 1;
    if (nextIndex < interviewQuestions.length) {
      setCurrentIndex(nextIndex);
      setTimeout(() => pushBot(interviewQuestions[nextIndex].text), 350);
      return;
    }

    setDone(true);
    finishInterview(newAnswers);
  }

  function handleRecordClick() {
    if (isRecording) {
      stop((finalTranscript) => {
        setInput(finalTranscript);
      });
      return;
    }

    setInput('');
    start();
  }

  function handleSend() {
    if (!input.trim() || done) return;
    submitAnswer(input);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  const isInputDisabled = done || isRecording || submitting;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerAvatar}>AI</div>
          <div>
            <div style={styles.headerName}>מראיין ScreenAI</div>
            <div style={styles.headerSub}>ראיון אוטומטי למועמד</div>
          </div>
        </div>

        <div style={styles.headerRight}>
          {isRecording ? (
            <div style={styles.recIndicator}>
              <span style={styles.recDot} />
              מקליט...
            </div>
          ) : null}

          <div
            style={{
              ...styles.progressChip,
              background: done ? '#dcfce7' : '#f3f0ff',
              color: done ? '#16a34a' : '#7c3aed',
              border: done ? '1px solid #bbf7d0' : '1px solid #ddd6fe',
            }}
          >
            {done ? 'הסתיים' : `${Math.min(currentIndex + 1, interviewQuestions.length)} / ${interviewQuestions.length}`}
          </div>
        </div>
      </div>

      <div style={styles.feed}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-start' : 'flex-end' }}>
            {msg.from === 'bot' ? <div style={styles.botAvatar}>AI</div> : null}
            <div style={msg.from === 'bot' ? styles.botBubble : styles.userBubble}>{msg.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!supported ? (
        <div style={styles.warning}>זיהוי דיבור אינו נתמך בדפדפן זה. מומלץ Chrome או Edge.</div>
      ) : null}
      {recError ? <div style={styles.warning}>{recError}</div> : null}
      {submitError ? <div style={styles.error}>{submitError}</div> : null}

      <div style={styles.inputRow}>
        <div
          style={{
            ...styles.textareaWrap,
            border: isRecording ? '1.5px solid #d4a017' : '1.5px solid #ddd6fe',
            boxShadow: isRecording ? '0 0 0 3px rgba(212,160,23,0.18)' : 'none',
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={done ? 'הראיון הסתיים.' : isRecording ? 'מאזין...' : 'הקלד/י תשובה...'}
            disabled={isInputDisabled}
            style={{ ...styles.textarea, color: isRecording ? '#92400e' : '#1f1535' }}
          />

          {supported ? (
            <button
              onClick={handleRecordClick}
              disabled={done || submitting}
              title={isRecording ? 'עצור הקלטה' : 'התחל הקלטה'}
              style={{
                ...styles.recBtn,
                boxShadow: isRecording ? '0 0 0 3px #d4a017, 0 0 0 6px rgba(212,160,23,0.22)' : '0 0 0 2px #ddd6fe',
                animation: isRecording ? 'recPulse 1.2s ease-in-out infinite' : 'none',
              }}
            >
              {isRecording ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ea580c">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#7c3aed">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '560px',
    height: '540px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #ede9fe',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(124,58,237,0.09)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid #f3f0ff',
    borderTop: '3px solid transparent',
    backgroundImage: 'linear-gradient(to right, #faf5ff, #fefce8), linear-gradient(90deg, #7c3aed, #d4a017)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  headerAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff',
    fontSize: '0.72rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 2px #d4a017',
    flexShrink: 0,
  },
  headerName: { fontWeight: 700, fontSize: '0.9rem', color: '#1f1535', lineHeight: 1.3 },
  headerSub: { fontSize: '0.72rem', color: '#7c6f8e', marginTop: '1px' },
  progressChip: {
    padding: '0.28rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    transition: 'background 0.2s, color 0.2s',
  },
  recIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#dc2626',
    background: 'rgba(220,38,38,0.07)',
    padding: '0.25rem 0.6rem',
    borderRadius: '999px',
    border: '1px solid rgba(220,38,38,0.2)',
  },
  recDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#dc2626',
    display: 'inline-block',
    animation: 'recPulse 1s ease-in-out infinite',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  botAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-end',
    marginLeft: '0.5rem',
    marginBottom: '2px',
  },
  botBubble: {
    maxWidth: '72%',
    background: '#f5f3ff',
    border: '1px solid #ede9fe',
    color: '#1f1535',
    padding: '0.7rem 1rem',
    borderRadius: '14px 0 14px 14px',
    fontSize: '0.875rem',
    lineHeight: 1.55,
  },
  userBubble: {
    maxWidth: '72%',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    padding: '0.7rem 1rem',
    borderRadius: '14px 14px 14px 0',
    fontSize: '0.875rem',
    lineHeight: 1.55,
  },
  warning: {
    background: '#fef9c3',
    color: '#92400e',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  inputRow: {
    display: 'flex',
    gap: '0.6rem',
    padding: '0.85rem 1rem',
    borderTop: '1px solid #f3f0ff',
    background: '#faf8ff',
    alignItems: 'flex-end',
  },
  textareaWrap: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '12px',
    background: '#fff',
    transition: 'border 0.15s, box-shadow 0.15s',
    overflow: 'hidden',
  },
  textarea: {
    flex: 1,
    padding: '0.65rem 3rem 0.65rem 0.9rem',
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    resize: 'none',
    fontFamily: 'inherit',
    background: 'transparent',
    lineHeight: 1.5,
    color: '#1f1535',
    height: '52px',
    overflowY: 'auto',
  },
  recBtn: {
    position: 'absolute',
    left: '0.5rem',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'box-shadow 0.15s',
    padding: 0,
  },
};
