import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecorder(lang = 'he-IL') {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [interim, setInterim]         = useState('');
  const [error, setError]             = useState('');
  const [supported]                   = useState(() => !!SpeechRecognition);

  const recognitionRef  = useRef(null);
  const finalRef        = useRef('');
  const onStopCallback  = useRef(null);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;

    finalRef.current = '';
    setTranscript('');
    setInterim('');
    setError('');

    const rec = new SpeechRecognition();
    rec.lang           = lang;
    rec.continuous     = true;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += chunk + ' ';
        } else {
          interimText += chunk;
        }
      }
      setTranscript(finalRef.current.trim());
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone in browser settings.');
      }
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
      setInterim('');
      const final = finalRef.current.trim();
      setTranscript(final);
      onStopCallback.current?.(final);
      onStopCallback.current = null;
    };

    rec.start();
    setIsRecording(true);
  }, [lang]);

  const stop = useCallback((callback) => {
    onStopCallback.current = callback ?? null;
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    finalRef.current = '';
    setTranscript('');
    setInterim('');
    setIsRecording(false);
    setError('');
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isRecording, transcript, interim, supported, error, start, stop, reset };
}
