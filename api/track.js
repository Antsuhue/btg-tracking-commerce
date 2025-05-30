export default function handler(req, res) {
    const { account, event, domain, items } = req.query;

    // Logs simples para debug (opcional)
    console.log("BTG Tracking Received:", {
        account,
        event,
        domain,
        items: decodeURIComponent(items || "")
    });

    // Aqui você pode incluir lógica para salvar os dados, enviar para webhook, etc.

    // GIF transparente 1x1 (base64)
    const transparentGif = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        'base64'
    );

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(transparentGif);
}
