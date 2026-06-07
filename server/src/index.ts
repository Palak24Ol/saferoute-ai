import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import connectDB from './config/mongo';
import userRoute from './interfaces/routes/userRoute';
import driverRouter from './interfaces/routes/driverRoute';
import adminRoute from './interfaces/routes/adminRoute';
import safetyRoute from './interfaces/routes/safetyRoute';
import adminSafetyRoute from './interfaces/routes/adminSafetyRoute';
import { setUpSocketIO } from './services/socket-io';

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const allowedOrigins = [process.env.SOCKET_FRONTEND_URL];
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

app.use(
    session({
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

// Existing routes
app.use('/', userRoute);
app.use('/driver', driverRouter);
app.use('/admin', adminRoute);

// New SafeRoute AI safety routes
app.use('/safety', safetyRoute);
app.use('/admin/safety', adminSafetyRoute);

const port = 3000;
connectDB();
setUpSocketIO(server);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'SafeRoute AI server running', timestamp: new Date() });
});

server.listen(port, () => {
    return console.log(`SafeRoute AI server running at http://localhost:${port}`);
});
