export function handleError(res, err) {
    console.error(err);
    return res.status(500).json({error: "Database error!"});
}

export function validateID(id) {
    const parsed = parseInt(id);
    return isNaN(parsed) ? null : parsed;
}

export function formatTags(posts) {
    return posts.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',') : []
    }));
}

export function badRequest(res) {
    return res.status(400).json({ error: "Bad request. Invalid ID." });
}