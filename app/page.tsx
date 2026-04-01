'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  'Beauty',
  'Wellness',
  'Home',
  'Repairs',
  'Tech',
  'Pets',
  'Auto',
  'Moving',
  'Activities',
  'Events',
  'Creative',
];

const subcategoriesByCategory: Record<string, string[]> = {
  Beauty: ['Hair', 'Nails', 'Brows', 'Lashes', 'Makeup', 'Keratin'],
  Wellness: ['Massage', 'Spa', 'Therapy', 'Recovery', 'Yoga'],
  Home: ['Cleaning', 'Handyman', 'Plumbing', 'Electrical', 'Furniture assembly'],
  Repairs: ['Appliance repair', 'Phone repair', 'Laptop repair', 'TV repair', 'Shoe repair'],
  Tech: ['Phone', 'Laptop', 'Tablet', 'Computer help', 'Setup'],
  Pets: ['Grooming', 'Dog walking', 'Pet sitting', 'Pet taxi', 'Training'],
  Auto: ['Car wash', 'Detailing', 'Diagnostics', 'Tire service'],
  Moving: ['Delivery', 'Moving help', 'Furniture transport', 'Courier'],
  Activities: ['Fitness', 'Dance', 'Tutor', 'Kids activities'],
  Events: ['Decorator', 'Host', 'Photographer', 'Makeup for events'],
  Creative: ['Design', 'Photo', 'Video', 'Editing', 'Content creation'],
};

export default function AddServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [subcategory, setSubcategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [availableToday, setAvailableToday] = useState(true);

  const [atClient, setAtClient] = useState(true);
  const [atMyPlace, setAtMyPlace] = useState(false);
  const [online, setOnline] = useState(false);

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [wallet, setWallet] = useState(false);

  const subcategories = subcategoriesByCategory[category] || [];

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const nextSubs = subcategoriesByCategory[value] || [];
    setSubcategory(nextSubs[0] || '');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f5f1',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(247,245,241,0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e6dfd5',
            padding: '16px 16px 14px',
            display: 'grid',
            gridTemplateColumns: '44px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 30,
              color: '#1f2430',
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1f2430',
            }}
          >
            Add your service
          </div>
        </header>

        <section style={{ padding: '18px 16px 0' }}>
          <button
            style={{
              width: '100%',
              border: '1px solid #dfe4de',
              background: '#fff',
              borderRadius: 18,
              padding: '18px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: '2px solid #4ea560',
                color: '#4ea560',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              +
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#2d7b3c',
              }}
            >
              Upload photos
            </span>
          </button>
        </section>

        <section style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Service title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter service title"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your service..."
              rows={4}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Category
            </div>

            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 14,
                background: '#fff',
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Subcategory
            </div>

            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                background: '#fff',
              }}
            >
              {subcategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Price
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Location / area
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Select location / area"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Working hours
            </label>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Select hours"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  Available today
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#7a8490',
                    marginTop: 4,
                  }}
                >
                  This affects the map pin status
                </div>
              </div>

              <button
                onClick={() => setAvailableToday((v) => !v)}
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: availableToday ? '#4f91f1' : '#d6dbe2',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: availableToday ? 32 : 4,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                />
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}
            >
              <button
                onClick={() => setAtClient((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: atClient ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atClient ? '#5aa764' : '#faf8f4',
                  color: atClient ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                At client
              </button>

              <button
                onClick={() => setAtMyPlace((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: atMyPlace ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atMyPlace ? '#5aa764' : '#faf8f4',
                  color: atMyPlace ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                At my place
              </button>

              <button
                onClick={() => setOnline((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: online ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: online ? '#5aa764' : '#faf8f4',
                  color: online ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Online
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Payment methods
            </div>

            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
              }}
            >
              How can clients pay?
            </div>

            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              <button
                onClick={() => setCash((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: cash ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: cash ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 22 }}>💵</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Cash</span>
                <span style={{ fontSize: 18 }}>{cash ? '☑' : '☐'}</span>
              </button>

              <button
                onClick={() => setCard((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: card ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: card ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 22 }}>💳</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Card</span>
                <span style={{ fontSize: 18 }}>{card ? '☑' : '☐'}</span>
              </button>

              <button
                onClick={() => setWallet((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: wallet ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: wallet ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 22 }}>👛</span>
                <span style={{ flex: 1, textAlign: 'left' }}>E-money</span>
                <span style={{ fontSize: 18 }}>{wallet ? '☑' : '☐'}</span>
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Contact
            </div>

            <input
              placeholder="Phone"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              placeholder="WhatsApp"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              placeholder="Telegram"
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(247,245,241,0.98)',
          borderTop: '1px solid #e6dfd5',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              border: 'none',
              background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
              color: '#fff',
              borderRadius: 18,
              padding: '18px 18px',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
            }}
          >
            Publish service
          </button>
        </div>
      </div>
    </main>
  );
}
