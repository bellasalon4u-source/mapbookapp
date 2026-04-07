{selectedMaster ? (
  <section style={{ padding: '12px 14px 0' }}>
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e9e2d8',
        borderRadius: 24,
        padding: 14,
        boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <img
          src={selectedMaster.avatar}
          alt={selectedMaster.name || selectedMaster.title || 'Pro'}
          style={{
            width: 82,
            height: 82,
            borderRadius: 18,
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid #eee7de',
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#223145',
                  lineHeight: 1.15,
                }}
              >
                {selectedMaster.name || selectedMaster.title || 'Pro'}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: '#6f7a86',
                  fontWeight: 700,
                }}
              >
                {selectedMaster.subcategory || getCategoryLabel(selectedMaster.category, language)}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: '#6f7a86',
                  fontWeight: 700,
                }}
              >
                {selectedMaster.city || 'London'}
              </div>
            </div>

            <button
              onClick={() => setSelectedMaster(null)}
              style={{
                border: 'none',
                background: '#f4efe8',
                color: '#6b7480',
                width: 34,
                height: 34,
                borderRadius: 999,
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                borderRadius: 999,
                background: '#fff5f8',
                color: '#ff4f93',
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              ★ {selectedMaster.rating || 4.8}
            </div>

            <div
              style={{
                borderRadius: 999,
                background: selectedMaster.availableNow ? '#eefbe9' : '#f4f5f7',
                color: selectedMaster.availableNow ? '#2f9c47' : '#7c8691',
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {selectedMaster.availableNow ? tr.availableNow : tr.unavailableToday}
            </div>

            {selectedMaster.price ? (
              <div
                style={{
                  borderRadius: 999,
                  background: '#f5f1ea',
                  color: '#263545',
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {tr.from} {selectedMaster.price}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedMaster.description ? (
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.45,
            color: '#4d5865',
            fontWeight: 600,
          }}
        >
          {selectedMaster.description}
        </div>
      ) : null}

      {!!normalizePaymentMethods(selectedMaster.paymentMethods).length ? (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {normalizePaymentMethods(selectedMaster.paymentMethods).map((method) => {
            const badge = paymentBadge(method, language);

            return (
              <div
                key={method}
                style={{
                  border: '1px solid #ebe3d7',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '7px 11px',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#2b3745',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <button
          onClick={() => toggleLikedMaster(selectedMaster.id)}
          style={{
            border: '1px solid #eadfd2',
            background: '#fff',
            color: '#263545',
            borderRadius: 16,
            padding: '13px 12px',
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {likedMasterIds.includes(String(selectedMaster.id)) ? '♥ Saved' : '♡ Save'}
        </button>

        <button
          onClick={() => router.push(`/booking/${selectedMaster.id}`)}
          style={{
            border: 'none',
            background: '#2f241c',
            color: '#fff',
            borderRadius: 16,
            padding: '13px 12px',
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {tr.bookNow}
        </button>
      </div>
    </div>
  </section>
) : null}
