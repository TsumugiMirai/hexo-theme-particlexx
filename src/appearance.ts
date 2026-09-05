try {
  const preference = localStorage.getItem('particlexx-appearance');
  document.documentElement.dataset.theme = preference === 'dark' || preference === 'light' ? preference : 'auto';
} catch { document.documentElement.dataset.theme = 'auto'; }
