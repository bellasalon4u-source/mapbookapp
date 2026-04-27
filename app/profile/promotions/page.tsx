<button
  type="button"
  onClick={() => router.push('/profile/promotions/new')}
  style={{
    marginTop: 12,
    width: '100%',
    minHeight: 58,
    borderRadius: 19,
    border: `2.5px solid ${BRAND.border}`,
    background: BRAND.green,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
  }}
>
  ＋ {text.createPromotion}
</button>
