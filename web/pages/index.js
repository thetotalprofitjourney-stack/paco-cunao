import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [instructions, setInstructions] = useState('');

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

  if (success) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Paco el Cuñao - Registro Completado</title>
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
    <div className={styles.container}>
      <Head>
        <title>Paco el Cuñao - Juego por WhatsApp</title>
        <meta name="description" content="Ayuda a Paco a gestionar su hotel heredado" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Paco el Cuñao 🏨
        </h1>

        <p className={styles.description}>
          Un juego conversacional por WhatsApp donde ayudas a Paco,<br />
          un tipo entrañable que ha heredado un hotel caótico.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>📱 100% por WhatsApp</h3>
            <p>Juega desde tu móvil, sin apps ni registros complicados</p>
          </div>
          <div className={styles.feature}>
            <h3>🤖 IA Generativa</h3>
            <p>Cada partida es única, Paco responde según tus consejos</p>
          </div>
          <div className={styles.feature}>
            <h3>⏱️ Ritmo tranquilo</h3>
            <p>~5 intercambios al mes, ideal para jugar sin presión</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Regístrate para empezar</h2>

          {error && <div className={styles.error}>{error}</div>}

          <input
            type="text"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className={styles.input}
          />

          <input
            type="tel"
            placeholder="+34612345678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            pattern="\+[1-9]\d{1,14}"
            className={styles.input}
            title="Formato E.164, ej: +34612345678"
          />

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Registrando...' : 'Comenzar a jugar'}
          </button>

          <p className={styles.privacy}>
            Al registrarte aceptas que guardemos tu número para enviarte mensajes de juego por WhatsApp.
          </p>
        </form>
      </main>
    </div>
  );
}
