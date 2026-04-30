'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
    }, 2100);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2400);

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
            zIndex: 999999,
            background: '#ffffff',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <style jsx>{`
            @keyframes mapDrift {
              0% {
                transform: translate3d(-6px, -5px, 0) scale(1.025);
              }
              100% {
                transform: translate3d(6px, 5px, 0) scale(1.025);
              }
            }

            @keyframes logoIn {
              0% {
                transform: translateY(18px) scale(0.82);
                opacity: 0;
                filter: blur(5px);
              }
              55% {
                transform: translateY(0) scale(1.04);
                opacity: 1;
                filter: blur(0);
              }
              100% {
                transform: translateY(0) scale(1);
                opacity: 1;
                filter: blur(0);
              }
            }

            @keyframes logoFloat {
              0% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-4px);
              }
              100% {
                transform: translateY(0);
              }
            }

            @keyframes textIn {
              0% {
                opacity: 0;
                transform: translateY(14px);
              }
              50% {
                opacity: 0;
                transform: translateY(14px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes dotWave {
              0% {
                transform: translateY(0) scale(0.72);
                opacity: 0.42;
              }
              45% {
                transform: translateY(-6px) scale(1.16);
                opacity: 1;
              }
              100% {
                transform: translateY(0) scale(0.72);
                opacity: 0.42;
              }
            }

            @keyframes miniPinFloat {
              0% {
                transform: translateY(0);
                opacity: 0.22;
              }
              50% {
                transform: translateY(-5px);
                opacity: 0.46;
              }
              100% {
                transform: translateY(0);
                opacity: 0.22;
              }
            }

            @keyframes glow {
              0% {
                opacity: 0.42;
                transform: scale(0.96);
              }
              50% {
                opacity: 0.75;
                transform: scale(1.05);
              }
              100% {
                opacity: 0.48;
                transform: scale(1);
              }
            }
          `}</style>

          <div
            style={{
              position: 'absolute',
              inset: -70,
              animation: 'mapDrift 2.4s ease-in-out infinite alternate',
            }}
          >
            <svg
              viewBox="0 0 1000 1800"
              preserveAspectRatio="xMidYMid slice"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            >
              <rect width="1000" height="1800" fill="#ffffff" />

              <path
                d="M-80 250 C120 350 190 520 250 730 C305 930 410 1070 570 1240 C710 1390 820 1510 1070 1700"
                stroke="#e5e8ed"
                strokeWidth="32"
                fill="none"
                strokeLinecap="round"
                opacity="0.65"
              />

              <path
                d="M1090 90 C850 230 740 390 680 610 C620 830 575 990 420 1160 C270 1325 155 1480 40 1750"
                stroke="#e8ebf0"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                opacity="0.72"
              />

              <path
                d="M-70 840 C120 780 300 780 470 850 C650 925 780 1000 1070 930"
                stroke="#e6e9ef"
                strokeWidth="26"
                fill="none"
                strokeLinecap="round"
                opacity="0.58"
              />

              <path
                d="M170 120 C280 240 380 315 520 370 C650 420 770 520 900 710"
                stroke="#eef1f5"
                strokeWidth="11"
                fill="none"
                strokeLinecap="round"
                opacity="0.95"
              />

              {[
                'M105 440 L235 510 L330 645 L455 760 L590 820',
                'M720 230 L650 365 L610 525 L585 690 L640 835 L780 980',
                'M130 1260 L290 1190 L430 1200 L585 1260 L735 1395',
                'M260 260 L410 295 L545 385 L650 470',
                'M720 665 L810 750 L910 880',
                'M160 755 L275 820 L360 910 L455 980',
                'M620 1210 L720 1275 L800 1380 L900 1535',
                'M245 1510 L370 1430 L500 1410 L610 1460',
              ].map((path) => (
                <path
                  key={path}
                  d={path}
                  stroke="#edf0f4"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              ))}

              {[
                'M120 570 L205 610 L275 700 L365 760',
                'M725 455 L805 535 L890 640',
                'M330 1015 L395 1080 L470 1145',
                'M710 1010 L795 1090 L885 1175',
                'M165 1360 L260 1310 L340 1325',
                'M455 220 L505 355 L570 420 L660 450',
                'M780 1210 L845 1270 L900 1340 L960 1425',
                'M100 1110 L205 1040 L290 1060 L370 1130',
                'M540 1240 L480 1320 L390 1390 L285 1465',
                'M770 330 L850 420 L940 500',
                'M70 1490 L165 1555 L245 1660',
                'M585 650 L690 750 L820 830',
                'M240 970 L330 945 L420 970 L510 1045',
                'M590 210 L640 300 L720 375',
                'M95 350 L180 395 L255 465',
              ].map((path) => (
                <path
                  key={path}
                  d={path}
                  stroke="#f4f6f8"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="1"
                />
              ))}
            </svg>
          </div>

          <SmallPin left="18%" top="18%" size={22} delay="0s" />
          <SmallPin right="18%" top="31%" size={21} delay="0.2s" />
          <SmallPin left="14%" top="56%" size={21} delay="0.35s" />
          <SmallPin right="15%" top="61%" size={23} delay="0.1s" />
          <SmallPin left="56%" bottom="10%" size={22} delay="0.3s" />

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 520,
              height: 520,
              borderRadius: 999,
              background:
                'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 42%, rgba(255,255,255,0.14) 74%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              animation: 'glow 2.4s ease-in-out infinite',
            }}
          />

          <section
            aria-label="Olamep loading"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 430,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-20px)',
              }}
            >
              <div
                style={{
                  width: 136,
                  height: 164,
                  position: 'relative',
                  animation:
                    'logoIn 0.75s cubic-bezier(0.2, 0.9, 0.2, 1) both, logoFloat 1.8s ease-in-out 0.75s infinite',
                }}
              >
                <svg
                  viewBox="0 0 136 164"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    filter: 'drop-shadow(0 24px 30px rgba(7,27,70,0.18))',
                  }}
                >
                  <defs>
                    <linearGradient id="olamepBlue" x1="0%" y1="80%" x2="60%" y2="10%">
                      <stop offset="0%" stopColor="#1267ff" />
                      <stop offset="58%" stopColor="#00b8ff" />
                      <stop offset="100%" stopColor="#29d4c5" />
                    </linearGradient>

                    <linearGradient id="olamepGreen" x1="30%" y1="100%" x2="100%" y2="28%">
                      <stop offset="0%" stopColor="#006aa0" />
                      <stop offset="48%" stopColor="#22c85a" />
                      <stop offset="100%" stopColor="#b7e934" />
                    </linearGradient>

                    <linearGradient id="olamepWarm" x1="38%" y1="0%" x2="100%" y2="92%">
                      <stop offset="0%" stopColor="#ff2f91" />
                      <stop offset="34%" stopColor="#ff5b3d" />
                      <stop offset="68%" stopColor="#ffd72f" />
                      <stop offset="100%" stopColor="#ff8a32" />
                    </linearGradient>

                    <linearGradient id="olamepPink" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7448ff" />
                      <stop offset="56%" stopColor="#ff2f91" />
                      <stop offset="100%" stopColor="#ff5b3d" />
                    </linearGradient>

                    <clipPath id="pinClip">
                      <path d="M68 4C32.7 4 4 32.7 4 68c0 47 64 92 64 92s64-45 64-92C132 32.7 103.3 4 68 4Z" />
                    </clipPath>
                  </defs>

                  <path
                    d="M68 4C32.7 4 4 32.7 4 68c0 47 64 92 64 92s64-45 64-92C132 32.7 103.3 4 68 4Z"
                    fill="#ffffff"
                    opacity="0.95"
                  />

                  <g clipPath="url(#pinClip)">
                    <rect x="0" y="0" width="136" height="164" fill="url(#olamepWarm)" />

                    <path
                      d="M-10 94C18 48 48 23 86 5C55 2 25 16 9 44C-5 68 -3 84 -10 94Z"
                      fill="url(#olamepBlue)"
                    />

                    <path
                      d="M38 164C55 122 80 90 136 54V164H38Z"
                      fill="url(#olamepGreen)"
                    />

                    <path
                      d="M-8 136C18 102 50 90 87 106C108 115 122 136 134 164H-8V136Z"
                      fill="url(#olamepPink)"
                      opacity="0.92"
                    />

                    <path
                      d="M65 19C91 20 111 35 123 57C114 38 95 14 64 8C36 2 14 16 6 40C20 27 39 18 65 19Z"
                      fill="rgba(255,255,255,0.24)"
                    />

                    <path
                      d="M30 86C54 58 85 43 128 39C96 50 70 68 50 94C40 106 29 106 20 99C22 94 26 89 30 86Z"
                      fill="rgba(255,255,255,0.2)"
                    />
                  </g>

                  <circle
                    cx="68"
                    cy="67"
                    r="31"
                    fill="#ffffff"
                    filter="drop-shadow(0 7px 12px rgba(7,27,70,0.12))"
                  />

                  <path
                    d="M68 4C32.7 4 4 32.7 4 68c0 47 64 92 64 92s64-45 64-92C132 32.7 103.3 4 68 4Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <div
                style={{
                  marginTop: 16,
                  fontSize: 58,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: '-2.4px',
                  color: '#071b46',
                  textAlign: 'center',
                  textShadow: '0 8px 20px rgba(7,27,70,0.08)',
                  animation: 'textIn 0.95s ease-out both',
                }}
              >
                Olamep
              </div>

              <div
                style={{
                  marginTop: 27,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 15,
                }}
              >
                {[
                  { color: '#0e73d8', delay: '0s' },
                  { color: '#00b8c9', delay: '0.1s' },
                  { color: '#24c45a', delay: '0.2s' },
                  { color: '#ff9f1a', delay: '0.3s' },
                  { color: '#ff4f8b', delay: '0.4s' },
                ].map((dot) => (
                  <span
                    key={dot.color}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: dot.color,
                      boxShadow: `0 6px 16px ${dot.color}66`,
                      animation: `dotWave 0.85s ease-in-out ${dot.delay} infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function SmallPin({
  left,
  right,
  top,
  bottom,
  size,
  delay,
}: {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  size: number;
  delay: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        right,
        top,
        bottom,
        width: size,
        height: size + 8,
        animation: `miniPinFloat 2.2s ease-in-out ${delay} infinite`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -9,
          top: -5,
          width: size + 18,
          height: size + 18,
          borderRadius: 999,
          background: 'rgba(7,27,70,0.045)',
        }}
      />

      <svg
        viewBox="0 0 40 48"
        style={{
          width: size,
          height: size + 8,
          display: 'block',
          filter: 'drop-shadow(0 8px 12px rgba(7,27,70,0.1))',
        }}
      >
        <path
          d="M20 2C10.1 2 2 10.1 2 20c0 13.2 18 26 18 26s18-12.8 18-26C38 10.1 29.9 2 20 2Z"
          fill="#a7aeb7"
        />
        <circle cx="20" cy="20" r="7" fill="#ffffff" />
      </svg>
    </div>
  );
}
