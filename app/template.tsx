'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
    }, 1700);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {children}

      {showSplash ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background:
              'radial-gradient(circle at 50% 38%, #ffffff 0%, #fbfbfc 45%, #f3f4f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <style jsx>{`
            @keyframes olamepSplashPulse {
              0% {
                transform: translateY(0) scale(0.96);
                filter: drop-shadow(0 18px 22px rgba(7, 27, 70, 0.1));
              }
              45% {
                transform: translateY(-4px) scale(1.04);
                filter: drop-shadow(0 24px 30px rgba(7, 27, 70, 0.16));
              }
              100% {
                transform: translateY(0) scale(1);
                filter: drop-shadow(0 18px 22px rgba(7, 27, 70, 0.1));
              }
            }

            @keyframes olamepMapMove {
              0% {
                transform: translate3d(-8px, -6px, 0) scale(1.02);
              }
              100% {
                transform: translate3d(8px, 6px, 0) scale(1.02);
              }
            }

            @keyframes olamepPinFloat {
              0% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-5px);
              }
              100% {
                transform: translateY(0);
              }
            }

            @keyframes olamepPinPulse {
              0% {
                transform: scale(0.9);
                opacity: 0.22;
              }
              50% {
                transform: scale(1.15);
                opacity: 0.38;
              }
              100% {
                transform: scale(1);
                opacity: 0.26;
              }
            }
          `}</style>

          <div
            style={{
              position: 'absolute',
              inset: -40,
              animation: 'olamepMapMove 2s ease-in-out infinite alternate',
              opacity: 0.95,
            }}
          >
            <svg
              viewBox="0 0 1000 1800"
              preserveAspectRatio="xMidYMid slice"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <rect width="1000" height="1800" fill="transparent" />

              <path
                d="M80 180 C220 250 260 420 310 620 C350 780 420 930 560 1080 C700 1230 790 1390 930 1600"
                stroke="#d7d9de"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M900 120 C740 220 660 340 610 520 C570 670 540 840 420 980 C300 1120 180 1300 90 1570"
                stroke="#dfe1e5"
                strokeWidth="22"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M130 980 C260 930 380 910 510 960 C650 1010 770 1120 920 1180"
                stroke="#d4d7dc"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                opacity="0.88"
              />

              <path
                d="M120 330 L270 420 L360 560 L440 710 L560 790"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M660 260 L600 380 L560 520 L530 670 L580 820 L710 950"
                stroke="#e7e8ec"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M180 1220 L320 1150 L430 1160 L580 1210 L700 1330"
                stroke="#e4e6ea"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M280 220 L420 260 L540 340 L620 420"
                stroke="#eceef1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M700 640 L780 720 L860 840"
                stroke="#eceef1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M180 720 L280 780 L350 860 L420 930"
                stroke="#eceef1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M610 1180 L700 1230 L770 1320 L850 1450"
                stroke="#eceef1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M250 1450 L350 1370 L470 1350 L560 1380"
                stroke="#eceef1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M110 520 L190 560 L250 640 L330 700"
                stroke="#f0f1f3"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M690 430 L760 500 L820 590"
                stroke="#f0f1f3"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M310 980 L370 1040 L440 1100"
                stroke="#f0f1f3"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M690 980 L760 1050 L820 1110"
                stroke="#f0f1f3"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M170 1320 L240 1280 L300 1290"
                stroke="#f0f1f3"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div
            style={{
              position: 'absolute',
              left: '21%',
              top: '24%',
              width: 22,
              height: 22,
              animation: 'olamepPinFloat 2s ease-in-out infinite',
              opacity: 0.55,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: 'rgba(7,27,70,0.08)',
                animation: 'olamepPinPulse 2s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50% 50% 50% 0',
                background: '#111827',
                transform: 'rotate(-45deg)',
                position: 'relative',
                boxShadow: '0 6px 14px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ffffff',
                  left: 7,
                  top: 7,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: '22%',
              top: '33%',
              width: 18,
              height: 18,
              animation: 'olamepPinFloat 2.2s ease-in-out infinite',
              opacity: 0.42,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50% 50% 50% 0',
                background: '#2a2f39',
                transform: 'rotate(-45deg)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#ffffff',
                  left: 6,
                  top: 6,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: '29%',
              bottom: '25%',
              width: 16,
              height: 16,
              animation: 'olamepPinFloat 1.9s ease-in-out infinite',
              opacity: 0.35,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50% 50% 50% 0',
                background: '#374151',
                transform: 'rotate(-45deg)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#ffffff',
                  left: 5.5,
                  top: 5.5,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: '28%',
              bottom: '20%',
              width: 20,
              height: 20,
              animation: 'olamepPinFloat 2.1s ease-in-out infinite',
              opacity: 0.48,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: 'rgba(7,27,70,0.06)',
                animation: 'olamepPinPulse 2.1s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50% 50% 50% 0',
                background: '#1f2937',
                transform: 'rotate(-45deg)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ffffff',
                  left: 6.5,
                  top: 6.5,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              width: 270,
              height: 270,
              borderRadius: 999,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.42) 42%, rgba(255,255,255,0) 72%)',
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'relative',
              width: 138,
              height: 166,
              animation: 'olamepSplashPulse 2s ease-in-out',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50% 50% 58% 58%',
                background:
                  'conic-gradient(from 218deg, #0e73d8 0deg, #00a6ff 54deg, #24c45a 116deg, #ffd629 178deg, #ff2456 248deg, #7c3cff 310deg, #0e73d8 360deg)',
                transform: 'rotate(45deg)',
                border: '3px solid rgba(255,255,255,0.8)',
                boxShadow:
                  '0 24px 40px rgba(7,27,70,0.16), inset 0 0 22px rgba(255,255,255,0.32)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 39,
                top: 38,
                width: 60,
                height: 60,
                borderRadius: 999,
                background: '#ffffff',
                boxShadow:
                  'inset 0 0 0 1px rgba(7,27,70,0.04), 0 6px 16px rgba(7,27,70,0.1)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 25,
                top: 78,
                width: 88,
                height: 54,
                borderRadius: '999px 999px 22px 22px',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.02))',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
