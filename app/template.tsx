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
            background:
              'radial-gradient(circle at 50% 38%, #ffffff 0%, #fbfcfd 48%, #f4f6f9 100%)',
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
            @keyframes olamepMapDrift {
              0% {
                transform: translate3d(-7px, -6px, 0) scale(1.03);
              }
              100% {
                transform: translate3d(7px, 6px, 0) scale(1.03);
              }
            }

            @keyframes olamepLogoIn {
              0% {
                transform: translateY(18px) scale(0.82);
                opacity: 0;
                filter: blur(5px);
              }
              42% {
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

            @keyframes olamepLogoFloat {
              0% {
                transform: translateY(0) scale(1);
              }
              50% {
                transform: translateY(-5px) scale(1.02);
              }
              100% {
                transform: translateY(0) scale(1);
              }
            }

            @keyframes olamepTextIn {
              0% {
                transform: translateY(15px);
                opacity: 0;
              }
              45% {
                transform: translateY(15px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes olamepPinFloat {
              0% {
                transform: translateY(0);
                opacity: 0.38;
              }
              50% {
                transform: translateY(-6px);
                opacity: 0.68;
              }
              100% {
                transform: translateY(0);
                opacity: 0.38;
              }
            }

            @keyframes olamepDotPulse {
              0% {
                transform: translateY(0) scale(0.78);
                opacity: 0.4;
              }
              45% {
                transform: translateY(-5px) scale(1.15);
                opacity: 1;
              }
              100% {
                transform: translateY(0) scale(0.78);
                opacity: 0.4;
              }
            }

            @keyframes olamepSoftGlow {
              0% {
                transform: scale(0.9);
                opacity: 0.28;
              }
              50% {
                transform: scale(1.07);
                opacity: 0.52;
              }
              100% {
                transform: scale(0.98);
                opacity: 0.34;
              }
            }
          `}</style>

          <div
            style={{
              position: 'absolute',
              inset: -70,
              animation: 'olamepMapDrift 3s ease-in-out infinite alternate',
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
              <rect width="1000" height="1800" fill="transparent" />

              <path
                d="M80 170 C210 250 250 420 310 620 C360 790 430 930 565 1085 C705 1245 790 1390 940 1610"
                stroke="#e1e4e9"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                opacity="0.78"
              />

              <path
                d="M930 100 C760 225 675 350 620 535 C575 690 545 850 430 995 C310 1145 185 1320 90 1585"
                stroke="#e5e7ec"
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />

              <path
                d="M-20 760 C150 715 300 710 430 780 C570 855 720 930 1020 870"
                stroke="#e2e5ea"
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />

              {[
                'M120 330 L270 420 L360 560 L440 710 L560 790',
                'M660 260 L600 380 L560 520 L530 670 L580 820 L710 950',
                'M180 1220 L320 1150 L430 1160 L580 1210 L700 1330',
                'M280 220 L420 260 L540 340 L620 420',
                'M700 640 L780 720 L860 840',
                'M180 720 L280 780 L350 860 L420 930',
                'M610 1180 L700 1230 L770 1320 L850 1450',
                'M250 1450 L350 1370 L470 1350 L560 1380',
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
                'M110 520 L190 560 L250 640 L330 700',
                'M690 430 L760 500 L820 590',
                'M310 980 L370 1040 L440 1100',
                'M690 980 L760 1050 L820 1110',
                'M170 1320 L240 1280 L300 1290',
                'M430 250 L470 360 L520 410 L595 430',
                'M760 1180 L810 1230 L855 1290 L900 1355',
                'M120 1050 L205 990 L270 1000 L335 1060',
                'M520 1190 L465 1260 L390 1320 L300 1390',
                'M740 310 L815 390 L890 455',
                'M90 1420 L180 1480 L245 1570',
                'M570 620 L655 705 L760 775',
              ].map((path) => (
                <path
                  key={path}
                  d={path}
                  stroke="#f2f4f7"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.98"
                />
              ))}
            </svg>
          </div>

          <MapPin left="20%" top="18%" size={22} delay="0s" opacity={0.36} />
          <MapPin right="20%" top="31%" size={21} delay="0.25s" opacity={0.4} />
          <MapPin left="16%" top="55%" size={21} delay="0.45s" opacity={0.34} />
          <MapPin right="17%" top="63%" size={23} delay="0.15s" opacity={0.42} />
          <MapPin left="55%" bottom="12%" size={22} delay="0.35s" opacity={0.34} />

          <div
            style={{
              position: 'absolute',
              width: 430,
              height: 430,
              borderRadius: 999,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 44%, rgba(255,255,255,0.08) 74%, transparent 100%)',
              animation: 'olamepSoftGlow 3s ease-in-out infinite',
            }}
          />

          <section
            aria-label="Olamep loading"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 430,
              minHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: 130,
                height: 155,
                position: 'relative',
                animation:
                  'olamepLogoIn 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) both, olamepLogoFloat 2.1s ease-in-out 0.9s infinite',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50% 50% 58% 58%',
                  background:
                    'conic-gradient(from 218deg, #0e73d8 0deg, #00a6ff 52deg, #24c45a 112deg, #ffd629 172deg, #ff2456 246deg, #7c3cff 310deg, #0e73d8 360deg)',
                  transform: 'rotate(45deg)',
                  border: '3px solid rgba(255,255,255,0.88)',
                  boxShadow:
                    '0 22px 40px rgba(7,27,70,0.16), inset 0 0 28px rgba(255,255,255,0.38)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 37,
                  top: 36,
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: '#ffffff',
                  boxShadow:
                    'inset 0 0 0 1px rgba(7,27,70,0.04), 0 8px 18px rgba(7,27,70,0.1)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 74,
                  width: 82,
                  height: 50,
                  borderRadius: '999px 999px 22px 22px',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.02))',
                  transform: 'rotate(45deg)',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 60,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-2.4px',
                color: '#071b46',
                textAlign: 'center',
                textShadow: '0 8px 20px rgba(7,27,70,0.08)',
                animation: 'olamepTextIn 1.15s ease-out both',
              }}
            >
              Olamep
            </div>

            <div
              style={{
                marginTop: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
              }}
            >
              {[
                { color: '#0e73d8', delay: '0s' },
                { color: '#00b8c9', delay: '0.12s' },
                { color: '#24c45a', delay: '0.24s' },
                { color: '#ff9f1a', delay: '0.36s' },
                { color: '#ff5b8a', delay: '0.48s' },
              ].map((dot) => (
                <span
                  key={dot.color}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: dot.color,
                    boxShadow: `0 6px 14px ${dot.color}55`,
                    animation: `olamepDotPulse 0.9s ease-in-out ${dot.delay} infinite`,
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

function MapPin({
  left,
  right,
  top,
  bottom,
  size,
  delay,
  opacity,
}: {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  size: number;
  delay: string;
  opacity: number;
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
        height: size,
        animation: `olamepPinFloat 2.25s ease-in-out ${delay} infinite`,
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -9,
          borderRadius: '50%',
          background: 'rgba(7,27,70,0.06)',
        }}
      />

      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50% 50% 50% 0',
          background: '#8a929d',
          transform: 'rotate(-45deg)',
          position: 'relative',
          boxShadow: '0 8px 18px rgba(7,27,70,0.12)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: Math.max(6, size * 0.34),
            height: Math.max(6, size * 0.34),
            borderRadius: '50%',
            background: '#ffffff',
            left: size * 0.33,
            top: size * 0.33,
          }}
        />
      </div>
    </div>
  );
}
