import expressHandlebars from 'express-handlebars';
import express from 'express';
import authMiddleware from './config/auth.js';
import { PORT } from './config/conf.js';
import postsRouter from './routes/posts.js';
import { fetchPost, fetchPosts } from './controllers/posts.js';
import { fetchComments } from './controllers/comments.js';

const handlebars = expressHandlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
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
            return content.trim().replace(/\n/g, '<br>');
        },
        tagsFormat: function (tags) {
            return tags.join(', ');
        }
    }
});

const app = express();
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded());
app.use('/api/posts', postsRouter);
app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/home'));

app.get('/home', async (req, res) => {
    try {
        const posts = await fetchPosts({ mode: 'frontend' });
        res.render('home', {
            title: 'Home - Murny',
            script: '<script src="/scripts/home.js"></script>',
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading posts!");
    }
});

app.get('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        const comments = await fetchComments(id);
        res.render('post', {
            title: `${post.title} - Murny`,
            comments,
            post
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching post!");
    }
});

app.get('/login', async (req, res) => {
    res.render('login', {
        title: `Login - Murny`
    });
})

// app.get('/admin', authMiddleware, async (req, res) => {
app.get('/admin', async (req, res) => {
    try {
        const posts = await fetchPosts({ mode: 'frontend' });
        res.render('admin', {
            title: 'Admin Home - Murny',
            script: `<script src="/scripts/home.js"></script>
                <script src="/scripts/admin.js" ></script>`,
            posts
        });
    } catch (err) {
    console.log(err);
    res.status(500).send("Error loading posts!")
}
});

// app.get('/new', authMiddleware, (req, res) => {
app.get('/new', (req, res) => {
    res.render('new', {
        title: 'Create Post - Murny',
        script: '<script src="/scripts/create.js"></script>',
    });
});

// app.get('/update/:id', authMiddleware, async (req, res) => {
app.get('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        res.render('update', {
            title: 'Update Post - Murny',
            script: '<script src="/scripts/update.js"></script>',
            post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading post to update!");
    }
});

app.use((req, res) => {
    res.redirect('/home');
});

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}/home`);
});