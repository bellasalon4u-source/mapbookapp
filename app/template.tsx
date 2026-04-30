'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
    }, 2650);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3000);

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
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <style jsx>{`
            @keyframes mapDrift {
              0% {
                transform: translate3d(-10px, -8px, 0) scale(1.04);
              }
              100% {
                transform: translate3d(10px, 8px, 0) scale(1.04);
              }
            }

            @keyframes logoEnter {
              0% {
                transform: translateY(22px) scale(0.78);
                opacity: 0;
                filter: blur(7px);
              }
              45% {
                transform: translateY(0) scale(1.05);
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
                transform: translateY(0) scale(1);
              }
              50% {
                transform: translateY(-6px) scale(1.015);
              }
              100% {
                transform: translateY(0) scale(1);
              }
            }

            @keyframes textEnter {
              0% {
                transform: translateY(18px);
                opacity: 0;
              }
              48% {
                transform: translateY(18px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes dotWave {
              0% {
                transform: translateY(0) scale(0.72);
                opacity: 0.45;
              }
              45% {
                transform: translateY(-7px) scale(1.18);
                opacity: 1;
              }
              100% {
                transform: translateY(0) scale(0.72);
                opacity: 0.45;
              }
            }

            @keyframes smallPinFloat {
              0% {
                transform: translateY(0);
                opacity: 0.28;
              }
              50% {
                transform: translateY(-5px);
                opacity: 0.52;
              }
              100% {
                transform: translateY(0);
                opacity: 0.28;
              }
            }

            @keyframes glowPulse {
              0% {
                transform: scale(0.92);
                opacity: 0.42;
              }
              50% {
                transform: scale(1.08);
                opacity: 0.72;
              }
              100% {
                transform: scale(1);
                opacity: 0.5;
              }
            }
          `}</style>

          <div
            style={{
              position: 'absolute',
              inset: -80,
              animation: 'mapDrift 3s ease-in-out infinite alternate',
              opacity: 1,
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
                stroke="#e0e4ea"
                strokeWidth="34"
                fill="none"
                strokeLinecap="round"
                opacity="0.72"
              />

              <path
                d="M1090 90 C850 230 740 390 680 610 C620 830 575 990 420 1160 C270 1325 155 1480 40 1750"
                stroke="#e5e8ee"
                strokeWidth="30"
                fill="none"
                strokeLinecap="round"
                opacity="0.76"
              />

              <path
                d="M-70 840 C120 780 300 780 470 850 C650 925 780 1000 1070 930"
                stroke="#e2e6ec"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                opacity="0.64"
              />

              <path
                d="M170 120 C280 240 380 315 520 370 C650 420 770 520 900 710"
                stroke="#edf0f4"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                opacity="0.95"
              />

              <path
                d="M105 440 L235 510 L330 645 L455 760 L590 820"
                stroke="#e9edf2"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M720 230 L650 365 L610 525 L585 690 L640 835 L780 980"
                stroke="#e9edf2"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M130 1260 L290 1190 L430 1200 L585 1260 L735 1395"
                stroke="#e9edf2"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M260 260 L410 295 L545 385 L650 470"
                stroke="#eef1f5"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M720 665 L810 750 L910 880"
                stroke="#eef1f5"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M160 755 L275 820 L360 910 L455 980"
                stroke="#eef1f5"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M620 1210 L720 1275 L800 1380 L900 1535"
                stroke="#eef1f5"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M245 1510 L370 1430 L500 1410 L610 1460"
                stroke="#eef1f5"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />

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
                'M805 1540 L880 1605 L950 1695',
              ].map((path) => (
                <path
                  key={path}
                  d={path}
                  stroke="#f2f4f7"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="1"
                />
              ))}
            </svg>
          </div>

          <SmallPin left="18%" top="18%" size={23} delay="0s" />
          <SmallPin right="18%" top="31%" size={22} delay="0.2s" />
          <SmallPin left="14%" top="56%" size={22} delay="0.4s" />
          <SmallPin right="15%" top="61%" size={24} delay="0.1s" />
          <SmallPin left="56%" bottom="10%" size={23} delay="0.3s" />
          <SmallPin left="13%" bottom="22%" size={18} delay="0.5s" />

          <div
            style={{
              position: 'absolute',
              width: 520,
              height: 520,
              borderRadius: 999,
              background:
                'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.88) 40%, rgba(255,255,255,0.12) 74%, transparent 100%)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}
          />

          <section
            aria-label="Olamep loading"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 430,
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              boxSizing: 'border-box',
              marginTop: -18,
            }}
          >
            <div
              style={{
                width: 132,
                height: 160,
                position: 'relative',
                animation:
                  'logoEnter 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) both, logoFloat 2.1s ease-in-out 0.9s infinite',
              }}
            >
              <svg
                viewBox="0 0 132 160"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  filter: 'drop-shadow(0 24px 28px rgba(7,27,70,0.18))',
                }}
              >
                <defs>
                  <linearGradient id="pinBlue" x1="0%" y1="80%" x2="55%" y2="15%">
                    <stop offset="0%" stopColor="#1668ff" />
                    <stop offset="55%" stopColor="#00b8ff" />
                    <stop offset="100%" stopColor="#28d0c8" />
                  </linearGradient>

                  <linearGradient id="pinGreen" x1="35%" y1="100%" x2="100%" y2="30%">
                    <stop offset="0%" stopColor="#006c9c" />
                    <stop offset="45%" stopColor="#20c35a" />
                    <stop offset="100%" stopColor="#b7e82f" />
                  </linearGradient>

                  <linearGradient id="pinWarm" x1="45%" y1="0%" x2="100%" y2="95%">
                    <stop offset="0%" stopColor="#ff2f8a" />
                    <stop offset="35%" stopColor="#ff5b3d" />
                    <stop offset="68%" stopColor="#ffd42a" />
                    <stop offset="100%" stopColor="#ff7a2f" />
                  </linearGradient>

                  <linearGradient id="pinPink" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7a3cff" />
                    <stop offset="55%" stopColor="#ff2f8a" />
                    <stop offset="100%" stopColor="#ff5b3d" />
                  </linearGradient>

                  <clipPath id="pinShapeClip">
                    <path d="M66 4C31.8 4 4 31.8 4 66c0 45.5 62 90 62 90s62-44.5 62-90C128 31.8 100.2 4 66 4Z" />
                  </clipPath>
                </defs>

                <path
                  d="M66 4C31.8 4 4 31.8 4 66c0 45.5 62 90 62 90s62-44.5 62-90C128 31.8 100.2 4 66 4Z"
                  fill="#ffffff"
                  opacity="0.95"
                />

                <g clipPath="url(#pinShapeClip)">
                  <rect x="0" y="0" width="132" height="160" fill="url(#pinWarm)" />

                  <path
                    d="M-8 91C19 47 47 24 83 6C53 3 25 16 10 43C-4 67 -2 82 -8 91Z"
                    fill="url(#pinBlue)"
                  />

                  <path
                    d="M38 160C54 120 78 88 130 54V160H38Z"
                    fill="url(#pinGreen)"
                  />

                  <path
                    d="M-8 132C18 100 48 88 84 104C104 113 117 132 128 160H-8V132Z"
                    fill="url(#pinPink)"
                    opacity="0.92"
                  />

                  <path
                    d="M63 19C87 20 107 34 119 55C111 38 93 15 63 8C35 2 14 16 6 39C20 26 38 18 63 19Z"
                    fill="rgba(255,255,255,0.22)"
                  />

                  <path
                    d="M29 84C52 58 82 43 123 39C93 49 68 67 49 92C40 104 29 104 20 98C22 93 25 88 29 84Z"
                    fill="rgba(255,255,255,0.2)"
                  />
                </g>

                <circle
                  cx="66"
                  cy="65"
                  r="30"
                  fill="#ffffff"
                  filter="drop-shadow(0 7px 12px rgba(7,27,70,0.12))"
                />

                <path
                  d="M66 4C31.8 4 4 31.8 4 66c0 45.5 62 90 62 90s62-44.5 62-90C128 31.8 100.2 4 66 4Z"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 62,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-2.6px',
                color: '#071b46',
                textAlign: 'center',
                textShadow: '0 8px 20px rgba(7,27,70,0.08)',
                animation: 'textEnter 1.15s ease-out both',
              }}
            >
              Olamep
            </div>

            <div
              style={{
                marginTop: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              {[
                { color: '#0e73d8', delay: '0s' },
                { color: '#00b8c9', delay: '0.12s' },
                { color: '#24c45a', delay: '0.24s' },
                { color: '#ff9f1a', delay: '0.36s' },
                { color: '#ff4f8b', delay: '0.48s' },
              ].map((dot) => (
                <span
                  key={dot.color}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 999,
                    background: dot.color,
                    boxShadow: `0 6px 16px ${dot.color}66`,
                    animation: `dotWave 0.9s ease-in-out ${dot.delay} infinite`,
                  }}
                />
              ))}
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
        animation: `smallPinFloat 2.4s ease-in-out ${delay} infinite`,
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
          fill="#9aa2ad"
        />
        <circle cx="20" cy="20" r="7" fill="#ffffff" />
      </svg>
    </div>
  );
}
