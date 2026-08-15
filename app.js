import expressHandlebars from 'express-handlebars';
import express from 'express';
import cookieParser from 'cookie-parser';
import postsRouter from './routes/posts.js';
import authRouter from './routes/auth.js';
import { fetchPost, queryPostsWithSearchAndPagination } from './controllers/posts.js';
import { fetchComments } from './controllers/comments.js';
import { renderAccount } from './controllers/account.js';
import verifyToken, { verifyTokenOptional, verifyAdmin } from './config/auth.js';
import { PORT } from './config/conf.js';

const handlebars = expressHandlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    partialsDir: './views/partials',
    helpers: {
        formatDateInput: function (dateString) {
            return new Date(dateString).toISOString().slice(0, 16);
        },
        formatDate: function (dateString) {
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        },
        formatDateData: function (dateString) {
            return new Date(dateString).toISOString().slice(0, 10);
        },
        trimContent: function (content) {
            return content
                .trim()
                .split(/\n{2,}|\r?\n/)
                .filter((p) => p.trim().length > 0)
                .map((p) => `<p>${p.trim()}</p>`)
                .join('');
        },
        tagsFormat: function (tags) {
            return tags.join(', ');
        },
        eq: function (a, b) {
            return a === b;
        },
        ne: function (a, b) {
            return a !== b;
        },
        gt: function (a, b) {
            return a > b;
        },
        lt: function (a, b) {
            return a < b;
        },
        add: function (a, b) {
            return a + b;
        },
        subtract: function (a, b) {
            return a - b;
        },
        range: function (start, end) {
            const arr = [];
            for (let i = start; i <= end; i++) {
                arr.push(i);
            }
            return arr;
        },
        or: function (a, b) {
            return a || b;
        },
    },
});

const app = express();
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use(express.static('public'));

app.get('/', verifyTokenOptional, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await queryPostsWithSearchAndPagination({
            term: null,
            page,
        });

        const isAuthenticated = !!req.user;
        const isAdmin = req.user?.role === 'admin';

        res.render('home', {
            title: 'Home - Milten',
            script: `<script src="/scripts/home.js"></script>${isAdmin ? '<script src="/scripts/admin.js"></script>' : ''}`,
            posts: result.posts,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                pageSize: result.pageSize,
            },
            isSearch: false,
            query: null,
            isAuthenticated,
            isAdmin,
            user: req.user || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading posts!');
    }
});

app.get('/search', verifyTokenOptional, async (req, res) => {
    try {
        const query = req.query.q || req.query.term || '';
        const page = parseInt(req.query.page) || 1;

        const result = await queryPostsWithSearchAndPagination({
            term: query,
            page,
        });

        const isAuthenticated = !!req.user;
        const isAdmin = req.user?.role === 'admin';

        res.render('home', {
            title: query ? `Search: ${query} - Milten` : 'Search - Milten',
            script: `<script src="/scripts/home.js"></script>${isAdmin ? '<script src="/scripts/admin.js"></script>' : ''}`,
            posts: result.posts,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                pageSize: result.pageSize,
            },
            isSearch: true,
            query: query,
            isAuthenticated,
            isAdmin,
            user: req.user || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error performing search!');
    }
});

app.get('/post/:id', verifyTokenOptional, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        const comments = await fetchComments(id);
        const isAuthenticated = !!req.user;
        const isAdmin = req.user?.role === 'admin';
        res.render('post', {
            title: `${post.title} - Milten`,
            script: '<script src="/scripts/post.js"></script>',
            comments,
            post,
            user: req.user || null,
            isAuthenticated,
            isAdmin,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching post!');
    }
});

app.get('/login', verifyTokenOptional, async (req, res) => {
    const isAuthenticated = !!req.user;
    const isAdmin = req.user?.role === 'admin';
    res.render('login', {
        title: `Login - Milten`,
        script: '<script src="/scripts/login.js"></script>',
        isAuthenticated,
        isAdmin,
        user: req.user || null,
    });
});

app.get('/register', verifyTokenOptional, async (req, res) => {
    const isAuthenticated = !!req.user;
    const isAdmin = req.user?.role === 'admin';
    res.render('register', {
        title: `Register - Milten`,
        script: '<script src="/scripts/register.js"></script>',
        isAuthenticated,
        isAdmin,
        user: req.user || null,
    });
});

app.get('/new', verifyToken, verifyAdmin, (req, res) => {
    const isAuthenticated = !!req.user;
    const isAdmin = req.user?.role === 'admin';
    res.render('new', {
        title: 'Create Post - Milten',
        script: '<script src="/scripts/create.js"></script>',
        isAuthenticated,
        isAdmin,
        user: req.user || null,
    });
});

app.get('/update/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        const isAuthenticated = !!req.user;
        const isAdmin = req.user?.role === 'admin';
        res.render('update', {
            title: 'Update Post - Milten',
            script: '<script src="/scripts/update.js"></script>',
            post,
            isAuthenticated,
            isAdmin,
            user: req.user || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading post to update!');
    }
});

app.get('/account', verifyToken, renderAccount);

app.use((req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}/`);
});
