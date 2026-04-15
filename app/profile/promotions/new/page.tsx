'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentMethod = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentBg: string;
  accentColor: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    title: 'Банковская карта',
    subtitle: 'Visa / Mastercard',
    icon: '💳',
    accentBg: '#edf4ff',
    accentColor: '#2f7cf6',
  },
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Быстрая оплата',
    icon: '🅿️',
    accentBg: '#eef5ff',
    accentColor: '#2563eb',
  },
  {
    id: 'apple-pay',
    title: 'Apple Pay',
    subtitle: 'Express checkout',
    icon: '',
    accentBg: '#f4efe8',
    accentColor: '#17130f',
  },
  {
    id: 'google-pay',
    title: 'Google Pay',
    subtitle: 'Оплата в 1 касание',
    icon: '🟢',
    accentBg: '#eef9f1',
    accentColor: '#2fa35a',
  },
  {
    id: 'wallet',
    title: 'Баланс MapBook',
    subtitle: 'Списать с кошелька',
    icon: '👛',
    accentBg: '#fff1f7',
    accentColor: '#ff4fa0',
  },
  {
    id: 'crypto',
    title: 'Криптокошелёк',
    subtitle: 'USDT / USDC',
    icon: '₿',
    accentBg: '#fff6e8',
    accentColor: '#d68612',
  },
  {
    id: 'bank',
    title: 'Банковский перевод',
    subtitle: 'Manual transfer',
    icon: '🏦',
    accentBg: '#f3efff',
    accentColor: '#7a5af8',
  },
];

export default function NewPromotionPage() {
  const router = useRouter();

  const [discountTitle, setDiscountTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(1);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [photoName, setPhotoName] = useState('');

  const totalPrice = useMemo(() => days * 1, [days]);

  const daysOptions = Array.from({ length: 100 }, (_, index) => index + 1);

  const selectedPaymentData = paymentMethods.find((item) => item.id === selectedPayment);

  const publishText =
    days === 1
      ? `Опубликовать скидку на ${days} день: £${totalPrice}`
      : `Опубликовать скидку на ${days} дней: £${totalPrice}`;

  const handleFakePhotoUpload = () => {
    setPhotoName('discount-photo.jpg');
  };

  const handleOpenPayment = () => {
    setShowPaymentSheet(true);
    setIsSuccess(false);
  };

  const handlePay = () => {
    setShowPaymentSheet(false);
    setIsSuccess(true);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f4ee',
          padding: '20px 16px 120px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr',
              gap: 14,
              alignItems: 'start',
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 28,
                fontWeight: 900,
                color: '#17130f',
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                Добавить скидку дня
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: '#6f675f',
                  fontWeight: 700,
                }}
              >
                Создайте уникальное предложение только на сегодня.
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              Название скидки <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <input
              value={discountTitle}
              onChange={(e) => setDiscountTitle(e.target.value)}
              placeholder="Введите название скидки"
              style={{
                width: '100%',
                height: 58,
                borderRadius: 18,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '0 16px',
                fontSize: 16,
                color: '#17130f',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 132px 26px',
                gap: 10,
                alignItems: 'end',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  Размер скидки <span style={{ color: '#ef4444' }}>*</span>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  Только сегодня
                </div>
              </div>

              <div>
                <input
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value.replace(/[^\d]/g, ''))}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#fff',
                    padding: '0 16px',
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                />
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: '#7b7268',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Только сегодня
                </div>
              </div>

              <div
                style={{
                  height: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                %
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                height: 1,
                background: '#e7ddd0',
              }}
            />

            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              Описание
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание..."
              rows={4}
              style={{
                width: '100%',
                borderRadius: 18,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '14px 16px',
                fontSize: 16,
                color: '#17130f',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'Arial, sans-serif',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 14,
              }}
            >
              Выбрать количество дней
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setShowDaysPicker((prev) => !prev)}
                style={{
                  height: 62,
                  borderRadius: 20,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {days}
                </span>

                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  ›
                </span>
              </button>

              <div
                style={{
                  minWidth: 96,
                  height: 62,
                  borderRadius: 20,
                  border: '1.5px solid #111111',
                  background: '#edf9ef',
                  color: '#2fa35a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 900,
                  padding: '0 12px',
                  boxSizing: 'border-box',
                }}
              >
                £{totalPrice}
              </div>
            </div>

            {showDaysPicker ? (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 24,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {daysOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDays(value);
                        setShowDaysPicker(false);
                      }}
                      style={{
                        width: '100%',
                        height: 52,
                        border: 'none',
                        borderBottom:
                          value === daysOptions[daysOptions.length - 1]
                            ? 'none'
                            : '1px solid #ece3d7',
                        background: value === days ? '#f3fbf3' : '#fff',
                        color: value === days ? '#2fa35a' : '#17130f',
                        fontSize: 20,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowDaysPicker(false)}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#2f8c67',
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleOpenPayment}
            style={{
              marginTop: 16,
              width: '100%',
              height: 60,
              borderRadius: 22,
              border: '2px solid #111111',
              background: '#2f8c67',
              color: '#fff',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 0 rgba(17,17,17,0.08)',
            }}
          >
            {publishText}
          </button>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {[1, 2, 3].map((value) => (
              <div
                key={value}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  border: '1.5px solid #111111',
                  background: days === value ? '#eef9f1' : '#fff',
                  color: days === value ? '#2fa35a' : '#6d6258',
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {value} {value === 1 ? 'день' : value < 5 ? 'дня' : 'дней'} за £{value}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              Фото
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#7b7268',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Добавьте фото для привлечения внимания
            </div>

            <button
              type="button"
              onClick={handleFakePhotoUpload}
              style={{
                width: '100%',
                minHeight: 96,
                borderRadius: 22,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                gap: 14,
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  border: '2px solid #2f8c67',
                  background: '#f5fff8',
                  color: '#2f8c67',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  fontWeight: 700,
                }}
              >
                +
              </div>

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#2f8c67',
                  }}
                >
                  {photoName ? 'Фото добавлено' : 'Добавить фото'}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#7b7268',
                    fontWeight: 700,
                    wordBreak: 'break-word',
                  }}
                >
                  {photoName || 'JPG / PNG / WEBP'}
                </div>
              </div>
            </button>
          </div>

          {isSuccess ? (
            <div
              style={{
                marginTop: 16,
                borderRadius: 22,
                border: '2px solid #111111',
                background: '#edf4ff',
                color: '#2f7cf6',
                padding: '14px 16px',
                fontSize: 18,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              Готово
            </div>
          ) : null}
        </div>
      </main>

      {showPaymentSheet ? (
        <div
          onClick={() => setShowPaymentSheet(false)}
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
              background: '#fff',
              padding: 18,
              maxHeight: '86vh',
              overflowY: 'auto',
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
              Выберите способ оплаты
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
              Доступны все способы оплаты MapBook
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#f8fbff',
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
                Итого к оплате
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#2f8c67',
                }}
              >
                £{totalPrice}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gap: 12,
              }}
            >
              {paymentMethods.map((method) => {
                const active = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    style={{
                      width: '100%',
                      borderRadius: 22,
                      border: '2px solid #111111',
                      background: active ? '#fcfaf6' : '#fff',
                      padding: 14,
                      display: 'grid',
                      gridTemplateColumns: '54px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 18,
                        background: method.accentBg,
                        color: method.accentColor,
                        border: '2px solid #111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
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
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: active ? '#2f8c67' : '#fff',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                marginTop: 16,
                borderRadius: 20,
                border: '2px solid #111111',
                background: selectedPaymentData?.accentBg || '#edf4ff',
                padding: '14px 16px',
                fontSize: 14,
                color: selectedPaymentData?.accentColor || '#2f7cf6',
                fontWeight: 900,
              }}
            >
              Выбрано: {selectedPaymentData?.title}
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
                onClick={() => setShowPaymentSheet(false)}
                style={{
                  height: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#17130f',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handlePay}
                style={{
                  height: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#2f8c67',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Оплатить £{totalPrice}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
