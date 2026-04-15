'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

type RadiusOption = {
  id: '10' | '50' | '100';
  label: string;
  km: number;
  pricePerDay: number;
  color: string;
  bg: string;
};

const radiusOptions: RadiusOption[] = [
  {
    id: '10',
    label: '10 км',
    km: 10,
    pricePerDay: 1.0,
    color: '#2f8c67',
    bg: '#edf9ef',
  },
  {
    id: '50',
    label: '50 км',
    km: 50,
    pricePerDay: 2.0,
    color: '#c69212',
    bg: '#fff7d6',
  },
  {
    id: '100',
    label: '100 км',
    km: 100,
    pricePerDay: 3.5,
    color: '#e44b4b',
    bg: '#ffe6e6',
  },
];

export default function NewPromotionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState(10);
  const [radius, setRadius] = useState<RadiusOption['id']>('10');
  const [photoName, setPhotoName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedRadius =
    radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const totalPrice = Number((selectedRadius.pricePerDay * days).toFixed(2));

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    event.target.value = '';
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Введите название рекламы');
      return;
    }

    if (!description.trim()) {
      alert('Введите описание');
      return;
    }

    if (!price.trim()) {
      alert('Введите цену');
      return;
    }

    setIsSuccess(true);

    setTimeout(() => {
      router.push('/profile/promotions');
    }, 900);
  };

  return (
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
              Добавить рекламу
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
              Создайте яркую рекламу, чтобы получить больше просмотров и клиентов.
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
            Название рекламы <span style={{ color: '#ef4444' }}>*</span>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название рекламы"
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
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            Описание <span style={{ color: '#ef4444' }}>*</span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание рекламы..."
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

          <div
            style={{
              marginTop: 18,
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            Бейдж скидки / текста
          </div>

          <input
            value={discountText}
            onChange={(e) => setDiscountText(e.target.value)}
            placeholder="Например: -20% / TOP / NEW"
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
              gridTemplateColumns: '1fr 110px',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                  marginBottom: 12,
                }}
              >
                Цена <span style={{ color: '#ef4444' }}>*</span>
              </div>

              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Например: £25 today"
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
            </div>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                  marginBottom: 12,
                }}
              >
                Дни
              </div>

              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 58,
                  borderRadius: 18,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  padding: '0 12px',
                  fontSize: 16,
                  color: '#17130f',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 900,
                }}
              >
                {Array.from({ length: 21 }, (_, index) => index + 10).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            Видимость рекламы
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
            Реклама будет показываться в выбранном радиусе от текущей точки поиска услуг.
            Если точка поиска стоит рядом с вами — значит от неё. Если выбрана другая
            локация, например Париж — значит от Парижа.
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            {radiusOptions.map((option) => {
              const active = radius === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRadius(option.id)}
                  style={{
                    width: '100%',
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: active ? option.bg : '#fff',
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 12,
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
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
                      Радиус {option.label}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 14,
                        color: '#7b7268',
                        fontWeight: 700,
                      }}
                    >
                      £{option.pricePerDay} в день
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      border: '1.5px solid #111111',
                      background: option.bg,
                      color: option.color,
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {option.label}
                  </div>

                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: active ? option.color : '#fff',
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
            Добавьте фото для рекламы
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={handleOpenFilePicker}
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
                border: '2px solid #c69212',
                background: '#fff7d6',
                color: '#c69212',
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
                  color: '#17130f',
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

        <div
          style={{
            marginTop: 16,
            borderRadius: 24,
            border: '2px solid #111111',
            background: selectedRadius.bg,
            padding: 16,
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
            Итог рекламы
          </div>

          <div
            style={{
              display: 'grid',
              gap: 6,
              fontSize: 15,
              fontWeight: 800,
              color: '#17130f',
            }}
          >
            <div>Радиус: {selectedRadius.label}</div>
            <div>Срок: {days} дней</div>
            <div>Ставка: £{selectedRadius.pricePerDay} / день</div>
            <div style={{ color: selectedRadius.color, fontSize: 18 }}>
              Итого: £{totalPrice}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          style={{
            marginTop: 16,
            width: '100%',
            height: 60,
            borderRadius: 22,
            border: '2px solid #111111',
            background: '#ffe44d',
            color: '#17130f',
            fontSize: 18,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 6px 0 rgba(17,17,17,0.08)',
          }}
        >
          Опубликовать рекламу · £{totalPrice}
        </button>

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
  );
}
