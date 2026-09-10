import sanitizeHtml from 'sanitize-html';

const allowedTags = [
    'p',
    'strong',
    'em',
    's',
    'u',
    'sup',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
];

const sanitizeOptions = {
    allowedTags,
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
        a: ['http', 'https', 'mailto'],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
        a: (tagName, attribs) => {
            const href = attribs.href || '';
            let isExternalHttpLink = false;

            try {
                const url = new URL(href);
                isExternalHttpLink = url.protocol === 'http:' || url.protocol === 'https:';
            } catch {
                isExternalHttpLink = false;
            }

            if (isExternalHttpLink) {
                return {
                    tagName,
                    attribs: {
                        ...attribs,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                };
            }

            const { target, rel, ...safeAttribs } = attribs;
            return { tagName, attribs: safeAttribs };
        },
    },
};

function escapeText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function normalizeLegacyPlainText(content) {
    return content
        .split(/\r?\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeText(line)}</p>`)
        .join('');
}

export function sanitizeRichText(content) {
    if (typeof content !== 'string') return '';

    const normalized = /<\/?[a-z][^>]*>/i.test(content)
        ? content
        : normalizeLegacyPlainText(content);

    return sanitizeHtml(normalized, sanitizeOptions)
        .replace(/&nbsp;|&#160;|\u00a0/gi, ' ')
        .trim();
}

export function hasRichTextText(content) {
    if (typeof content !== 'string') return false;

    const textOnly = sanitizeHtml(content, {
        allowedTags: [],
        allowedAttributes: {},
    })
        .replace(/&nbsp;|&#160;|\u00a0/gi, ' ')
        .trim();

    return textOnly.length > 0;
}

export function richTextToPlainText(content) {
    if (typeof content !== 'string') return '';

    return sanitizeHtml(sanitizeRichText(content), {
        allowedTags: [],
        allowedAttributes: {},
    })
        .replace(/&nbsp;|&#160;|\u00a0/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export { sanitizeOptions };