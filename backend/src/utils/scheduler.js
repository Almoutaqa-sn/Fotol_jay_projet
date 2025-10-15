// Petit utilitaire pour scheduler une fonction à un moment donné
export function scheduleNotification(time, callback) {
    const delay = time.getTime() - Date.now();
    if (delay > 0) {
        setTimeout(callback, delay);
    } else {
        // si la date est déjà passée, exécuter tout de suite
        callback();
    }
}
