import base64 from 'base-64';

function decodeCredentials(authHeader) {
    if(!authHeader.startsWith('Basic ')) return ['', ''];
    
    try {
        const base64Credentials = authHeader.split(' ')[1];
        const decoded = base64.decode(base64Credentials);
        const [username, password] = decoded.split(':');
        return [username, password];
    } catch (err) {
        return ['', ''];
    }
}

export default function authMiddleware(req, res, next) {
    const [username, password] = decodeCredentials(
        req.headers.authorization || ''
    );

    const validUser = 'admin';
    const validPass = 'admin';

    if(username === validUser && password === validPass) {
        return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="user_pages"');
    res.status(401).send('Authentication required.');
}