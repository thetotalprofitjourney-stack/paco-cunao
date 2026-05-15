(function () {
  'use strict';

  // --- Config ---
  const config = (window.APP_CONFIG) || {};
  const whatsappRaw = (config.WHATSAPP_NUMBER || '+34XXXXXXXXX').replace(/\D/g, '');
  const whatsappUrl =
    'https://wa.me/' + whatsappRaw + '?text=' + encodeURIComponent('Hola Paco, ¿en qué puedo ayudarte?');

  // --- Elements ---
  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('input-name');
  const phoneInput = document.getElementById('input-phone');
  const submitBtn = document.getElementById('submit-btn');
  const errorBox = document.getElementById('error-box');
  const infoBtn = document.getElementById('info-btn');
  const infoModal = document.getElementById('info-modal');
  const infoModalClose = document.getElementById('info-modal-close');
  const successModal = document.getElementById('success-modal');
  const successInstructions = document.getElementById('success-instructions');
  const whatsappLink = document.getElementById('whatsapp-link');

  whatsappLink.href = whatsappUrl;

  // --- Form submit ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    setLoading(true);
    hideError();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.value, phone: phoneInput.value }),
      });

      const data = await response.json();

      if (data.success) {
        successInstructions.textContent = data.instructions;
        showModal(successModal);
      } else {
        showError(data.error || 'generic');
      }
    } catch (_err) {
      showError('connection');
    } finally {
      setLoading(false);
    }
  });

  // --- Info modal ---
  infoBtn.addEventListener('click', function () {
    showModal(infoModal);
  });

  infoModalClose.addEventListener('click', function () {
    hideModal(infoModal);
  });

  infoModal.addEventListener('click', function (e) {
    if (e.target === infoModal) hideModal(infoModal);
  });

  // --- Helpers ---
  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Registrando...' : 'Quiero ayudar a Paco';
  }

  function showError(type) {
    if (type === 'duplicate_phone') {
      errorBox.innerHTML =
        'Este número ya está registrado. Si eres tú, ya puedes escribir a Paco directamente por WhatsApp. Si no, manda un email a ' +
        '<a href="mailto:info@totalprofitjourney.com">info@totalprofitjourney.com</a>' +
        ' y Antonio o Raquel te podrán ayudar.';
    } else if (type === 'connection') {
      errorBox.textContent = 'Error de conexión. Inténtalo de nuevo.';
    } else {
      errorBox.textContent = 'No se ha podido completar el registro. Comprueba los datos e inténtalo de nuevo.';
    }
    errorBox.classList.remove('hidden');
  }

  function hideError() {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
  }

  function showModal(modal) {
    modal.classList.remove('hidden');
  }

  function hideModal(modal) {
    modal.classList.add('hidden');
  }
})();
