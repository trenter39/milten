export function validateID(id) {
    const parsed = parseInt(id);
    return isNaN(parsed) ? null : parsed;
}

export function ok(res, content) {
    return res.status(200).json(content);
}

export function created(res, content) {
    return res.status(201).json(content);
}

export function noContent(res) {
    return res.status(204).send();
}

export function badRequest(res, message) {
    return res.status(400).json({ error: message });
}

export function unauthorized(res, message) {
    return res.status(401).json({ error: message });
}

export function forbidden(res, message) {
    return res.status(403).json({ error: message });
}

export function notFound(res, message) {
    return res.status(404).json({ error: message });
}

export function conflict(res, message) {
    return res.status(409).json({ error: message });
}

export function internalServerError(res, error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error!' });
}
