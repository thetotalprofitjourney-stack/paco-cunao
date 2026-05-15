import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setInstructions(data.instructions);
      } else {
        setError(data.error || 'No se ha podido completar el registro. Comprueba los datos e inténtalo de nuevo');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const closeInfo = (e) => {
    if (e.target === e.currentTarget) {
      setShowInfo(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Ayuda a Paco - Registro Completado</title>
        </Head>

        <main className={styles.main}>
          <div className={styles.success}>
            <h1>¡Registro completado! ✅</h1>
            <p className={styles.instructions}>{instructions}</p>
            <div className={styles.highlight}>
              <p>Guarda este número en tu teléfono:</p>
              <p className={styles.phone}>{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+34XXXXXXXXX'}</p>
              <p>Y escríbele por WhatsApp para empezar a jugar</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.heroContainer}>
      <Head>
        <title>Ayuda a Paco - Su Hotel te Necesita</title>
        <meta name="description" content="Ayuda a Paco a gestionar el Hotel Villa Carmen que heredó en Badajoz. Juego por WhatsApp con IA." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero background image */}
      <div className={styles.heroImage}></div>

      {/* Dark overlay for better text readability */}
      <div className={styles.heroOverlay}></div>

      {/* Floating bottom form bar */}
      <div className={styles.formBar}>
        <form className={styles.inlineForm} onSubmit={handleSubmit}>
          <div className={styles.formTitle}>
            <h2>Todos hemos sido Paco alguna vez, ayúdale</h2>
            <button
              type="button"
              className={styles.infoButton}
              onClick={toggleInfo}
              aria-label="Más información"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
          </div>

          {error && <div className={styles.errorInline}>{error}</div>}

          <div className={styles.formInputs}>
            <input
              type="text"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={styles.inputInline}
              aria-label="Tu nombre"
            />

            <div className={styles.phoneInputWrapper}>
              <svg className={styles.whatsappIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <input
                type="tel"
                placeholder="+34612345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                pattern="\+[1-9]\d{1,14}"
                className={styles.inputInline}
                title="Formato internacional, ej: +34612345678"
                aria-label="Número de WhatsApp"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.ctaButton}>
              {loading ? 'Registrando...' : 'Quiero ayudar a Paco'}
            </button>
          </div>
        </form>
      </div>

      {/* Info popup modal */}
      {showInfo && (
        <div className={styles.modalOverlay} onClick={closeInfo}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalClose}
              onClick={() => setShowInfo(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <h3>¿En qué consiste?</h3>
            <div className={styles.modalBody}>
              <p>🎮 <strong>Un juego por WhatsApp</strong>, donde ayudas a Paco a gestionar el Hotel Villa Carmen que acaba de heredar.</p>
              <p>✨ <strong>Cada Paco es único</strong>. Él y su hotel irán evolucionando en función de los consejos que le vayas dando.</p>
              <p>⏱️ <strong>Ritmo tranquilo, sin presión, ~4 whatsapps al mes</strong>. Cada decisión cuenta, y Paco tiene que implementar cada acción que le recomiendes, lo que le llevará días.</p>
              <p>🔒 <strong>Privacidad garantizada</strong>. Tus datos sólo se usan para el juego. Puedes salir cuando quieras bloqueando el número o dejando de escribirle.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
