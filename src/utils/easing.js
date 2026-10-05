/**
 * Exponential ease-out — fast start, smooth deceleration.
 * Used by Lenis smooth scroll and programmatic scrollTo calls.
 *
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export const exponentialEaseOut = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
