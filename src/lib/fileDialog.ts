// Utility to trigger native file picker dialog
const SUPPORTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.webp';

export function triggerFileDialog(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = SUPPORTED_EXTENSIONS;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    // If dialog is cancelled, resolve null after a timeout
    window.addEventListener('focus', function onFocus() {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!input.files?.length) resolve(null);
      }, 300);
    });
    input.click();
  });
}
