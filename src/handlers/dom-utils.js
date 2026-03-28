
/**
 * Attempt to smoothly scroll the element referenced by the current URL hash into view.
 *
 * If window.location.hash is empty, the function returns immediately. Otherwise it
 * treats the hash as a selector (e.g. "#someId") and repeatedly queries the DOM
 * with document.querySelector for up to a maximum number of attempts (10 by default).
 * When the element is found it calls element.scrollIntoView({ behavior: "smooth" })
 * and stops. If the element is not present after the maximum retries, the function
 * stops attempting. Retries are scheduled using requestAnimationFrame.
 *
 * Side effects:
 * - Reads window.location.hash
 * - Calls document.querySelector
 * - Calls element.scrollIntoView with smooth behavior (if element is found)
 *
 * @function restoreScrollHash
 * @returns {void}
 */
export function restoreScrollHash() {
  const hash = window.location.hash;
  if (!hash) return;

  let attempts = 0;
  const maxAttempts = 10;

  const tryScroll = () => {
    const el = document.querySelector(hash);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (attempts++ < maxAttempts) {
      requestAnimationFrame(tryScroll);
    }
  };

  tryScroll();
}