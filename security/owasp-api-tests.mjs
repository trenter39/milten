import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const jwtSecret = process.env.JWT_SECRET || 'jwt_secret';
const userId = 1001;
const targetUserId = 1002;

function authCookie(id) {
    const token = jwt.sign({ id, role: 'user' }, jwtSecret, { expiresIn: '5m' });
    return `token=${token}`;
}

async function request(path, options = {}) {
    return fetch(new URL(path, baseUrl), options);
}

async function assertNoStackTrace(response, description) {
    const body = await response.text();
    assert.ok(
        !/(stack trace|at \w+ \(|node_modules|file:\/\/)/i.test(body),
        `${description} exposed implementation details`
    );
    return body;
}

async function testBola() {
    const response = await request(`/api/users/${targetUserId}/likes`, {
        headers: { Cookie: authCookie(userId) },
    });

    assert.ok(
        response.status === 401 || response.status === 403,
        `BOLA: expected 401/403, received ${response.status}`
    );
    await assertNoStackTrace(response, 'BOLA response');
}

async function testInjectionAndBoundaries() {
    const payloads = [
        { email: "' OR '1'='1", password: 'Password1' },
        { email: '<script>alert(1)</script>', password: 'Password1' },
        { email: `${'a'.repeat(300)}@example.com`, password: 'Password1' },
    ];

    for (const payload of payloads) {
        const response = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        assert.equal(response.status, 400, `Injection payload returned ${response.status}`);
        await assertNoStackTrace(response, 'Injection response');
    }
}

async function testRateLimit() {
    let rateLimited = false;
    for (let attempt = 0; attempt < 105; attempt++) {
        const response = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'invalid', password: 'invalid' }),
        });

        if (response.status === 429) {
            rateLimited = true;
            assert.ok(response.headers.get('retry-after'), '429 response lacks Retry-After');
            await assertNoStackTrace(response, 'Rate-limit response');
            break;
        }
    }

    assert.ok(rateLimited, '100+ login requests did not produce HTTP 429');
}

await testBola();
await testInjectionAndBoundaries();
await testRateLimit();
console.log('OWASP API threat checks passed: BOLA, injection, and rate limiting');
