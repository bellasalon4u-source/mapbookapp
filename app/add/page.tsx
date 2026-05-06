'use client';

import {
useEffect,
useState,
type CSSProperties,
} from 'react';

import { useRouter } from 'next/navigation';

import {
getSavedLanguage,
subscribeToLanguageChange,
type AppLanguage,
} from '../../services/i18n';

const BRAND = {
navy: '#071b46',
black: '#111111',
green: '#24c45a',
blue: '#1677ff',
muted: '#6f7887',
softGreen: '#eaffef',
};

type Texts = {
pageTitle: string;
pageSubtitle: string;
contactDetails: string;
contactHint: string;
continue: string;
};

const textsByLanguage: Partial<Record<AppLanguage, Texts>> = {
EN: {
pageTitle: 'Add your service',
pageSubtitle: 'Create a strong listing for clients nearby',
contactDetails: 'Contact details',
contactHint: 'Opens a separate sheet of channels',
continue: 'Continue',
},
};

function getText(language: AppLanguage) {
return textsByLanguage[language] || textsByLanguage.EN!;
}

function inputStyle(): CSSProperties {
return {
width: '100%',
height: 58,
borderRadius: 18,
border: 2px solid ${BRAND.black},
background: '#ffffff',
color: BRAND.navy,
padding: '0 16px',
fontSize: 16,
fontWeight: 900,
outline: 'none',
boxSizing: 'border-box',
};
}

export default function AddServicePage() {
const router = useRouter();

const [language, setLanguage] =
useState<AppLanguage>(getSavedLanguage());

const text = getText(language);

useEffect(() => {
setLanguage(getSavedLanguage());

const unsub = subscribeToLanguageChange((next) =>  
  setLanguage(next)  
);

return (
<>
<main
style={{
minHeight: '100vh',
background: '#ffffff',
fontFamily: 'Arial, sans-serif',
color: BRAND.navy,
paddingBottom: 112,
}}
>
<header
style={{
padding: '22px 24px 26px',
borderBottom: '1px solid #e2e7f0',
background: '#ffffff',
position: 'sticky',
top: 0,
zIndex: 30,
}}
>
<div
style={{
maxWidth: 430,
margin: '0 auto',
position: 'relative',
textAlign: 'center',
}}
>
<button
type="button"
onClick={() => router.back()}
style={{
position: 'absolute',
left: 0,
top: 0,
width: 54,
height: 54,
borderRadius: 999,
border: 2px solid ${BRAND.black},
background: '#fff',
color: BRAND.navy,
fontSize: 30,
fontWeight: 900,
}}
>
←
</button>

<button  
        type="button"  
        onClick={() => router.push('/')}  
        style={{  
          position: 'absolute',  
          right: 0,  
          top: 0,  
          width: 54,  
          height: 54,  
          borderRadius: 999,  
          border: `2px solid ${BRAND.black}`,  
          background: '#fff',  
          color: BRAND.navy,  
          fontSize: 28,  
          fontWeight: 900,  
        }}  
      >  
        ×  
      </button>  

      <h1  
        style={{  
          margin: '18px 0 0',  
          fontSize: 44,  
          lineHeight: 0.95,  
          fontWeight: 900,  
          color: BRAND.navy,  
        }}  
      >  
        {text.pageTitle}  
      </h1>  

      <div  
        style={{  
          marginTop: 12,  
          fontSize: 18,  
          lineHeight: 1.2,  
          fontWeight: 900,  
          color: BRAND.muted,  
        }}  
      >  
        {text.pageSubtitle}  
      </div>  
    </div>  
  </header>  

  <div  
    style={{  
      maxWidth: 430,  
      margin: '0 auto',  
      padding: '18px',  
      display: 'grid',  
      gap: 12,  
    }}  
  >  
    <div  
      style={{  
        borderRadius: 24,  
        border: `2px solid ${BRAND.black}`,  
        background: '#ffffff',  
        padding: 16,  
      }}  
    >  
      <div  
        style={{  
          fontSize: 28,  
          fontWeight: 900,  
          marginBottom: 12,  
        }}  
      >  
        {text.contactDetails}  
      </div>  

      <div  
        style={{  
          marginTop: 8,  
          display: 'flex',  
          alignItems: 'center',  
          gap: 8,  
        }}  
      >  
        <span  
          style={{  
            width: 32,  
            height: 32,  
            borderRadius: 10,  
            border: `1.5px solid ${BRAND.black}`,  
            background: BRAND.softGreen,  
            display: 'inline-flex',  
            alignItems: 'center',  
            justifyContent: 'center',  
            fontSize: 18,  
            flexShrink: 0,  
          }}  
        >  
          📞  
        </span>  

        <span  
          style={{  
            fontSize: 14,  
            fontWeight: 900,  
            color: BRAND.muted,  
          }}  
        >  
          {text.contactHint}  
        </span>  
      </div>  
    </div>  
  </div>  

  <div  
    style={{  
      position: 'fixed',  
      left: 0,  
      right: 0,  
      bottom: 0,  
      zIndex: 80,  
      background: 'rgba(255,255,255,0.96)',  
      borderTop: '1px solid #e2e7f0',  
      padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',  
    }}  
  >  
    <div style={{ maxWidth: 430, margin: '0 auto' }}>  
      <button  
        type="button"  
        style={{  
          width: '100%',  
          height: 68,  
          borderRadius: 24,  
          border: `2px solid ${BRAND.black}`,  
          background: BRAND.green,  
          color: '#ffffff',  
          fontSize: 24,  
          fontWeight: 900,  
        }}  
      >  
        {text.continue}  
      </button>  
    </div>  
  </div>  
</main>

</>
);
}
return () => unsub();
}, []);
