export function cameraUploadMiddleware(req, res, next) {
    try {
        const { images } = req.body; // images = [{ url, filename, capturedAt }]
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }

        // Vérifier que chaque image a été capturée (champ capturedAt ou flag captured=true)
        for (const img of images) {
            if (!img.capturedAt) {
                return res.status(400).json({ error: 'Toutes les images doivent provenir de la caméra' });
            }
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Erreur middleware upload' });
    }
}
