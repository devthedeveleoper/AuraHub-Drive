/**
 * Formats seconds into a hh:mm:ss time string.
 * @param {number} totalSeconds - The total seconds to format.
 * @returns {string} The formatted time string.
 */
export const formatTime = (totalSeconds) => {
  if (totalSeconds === Infinity || isNaN(totalSeconds) || totalSeconds < 0) {
    return '--:--:--';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};