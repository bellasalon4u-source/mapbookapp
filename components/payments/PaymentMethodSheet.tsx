'use client';

import { useEffect } from 'react';

export type PaymentSheetMethod = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentBg: string;
  accentColor: string;
};

type PaymentMethodSheetTexts = {
  title: string;
  subtitle: string;
  total: string;
  selected: string;
  cancel: string;
  pay: string;
};

type PaymentMethodSheetProps = {
  open: boolean;
  amount: number;
  methods: PaymentSheetMethod[];
  selectedMethodId: string;
  texts: PaymentMethodSheetTexts;
  onClose: () => void;
  onSelect: (methodId: string) => void;
  onPay: () => void;
};

export default function PaymentMethodSheet({
  open,
  amount,
  methods,
  selectedMethodId,
  texts,
  onClose,
  onSelect,
  onPay,
}: PaymentMethodSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) || methods[0];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,17,17,0.38)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          borderRadius: 28,
          border: '2px solid #111111',
          background: '#ffffff',
          padding: 18,
          maxHeight: '86vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {texts.title}
        </div>

        <div
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 14,
            color: '#7b7268',
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {texts.subtitle}
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 20,
            border: '2px solid #111111',
            background: '#ffffff',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {texts.total}
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#2f8c67',
            }}
          >
            £{amount}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          {methods.map((method) => {
            const active = selectedMethodId === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelect(method.id)}
                style={{
                  width: '100%',
                  minHeight: 72,
                  borderRadius: 20,
                  border: '1.5px solid #111111',
                  background: '#ffffff',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    border: '1.5px solid #111111',
                    background: method.accentBg,
                    color: method.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  {method.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {method.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: '#7b7268',
                      fontWeight: 700,
                    }}
                  >
                    {method.subtitle}
                  </div>
                </div>

                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: active ? '#17130f' : '#fff',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {active ? '✓' : ''}
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 18,
            border: '1.5px solid #111111',
            background: selectedMethod?.accentBg || '#f5f5f5',
            padding: '12px 14px',
            fontSize: 14,
            fontWeight: 900,
            color: selectedMethod?.accentColor || '#17130f',
          }}
        >
          {texts.selected}: {selectedMethod?.title || ''}
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 54,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#ffffff',
              color: '#17130f',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {texts.cancel}
          </button>

          <button
            type="button"
            onClick={onPay}
            style={{
              height: 54,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#17130f',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {texts.pay} £{amount}
          </button>
        </div>
      </div>
    </div>
  );
}
