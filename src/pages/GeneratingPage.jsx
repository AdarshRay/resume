import { useEffect, useState } from 'react';

export default function GeneratingPage({ progress = 0 }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-sm w-full text-center fade-up">
        {/* Spinner */}
        <div className="mx-auto mb-6" style={{ width: 56, height: 56 }}>
          <div
            className="spin"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '3px solid var(--c-white-a06)',
              borderTopColor: '#00E5A0',
            }}
          />
        </div>

        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>
          AI is analyzing your resume{dots}
        </h2>
        <p className="text-[12px] mb-6" style={{ color: 'var(--c-text-faint)' }}>
          Extracting information and structuring your data
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-white-a06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#00E5A0,#00CC8E)',
              boxShadow: '0 0 12px rgba(0,229,160,.3)',
            }}
          />
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--c-text-ghost)' }}>{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
