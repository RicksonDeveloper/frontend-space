import express from 'express';
import cors from 'cors';
import { settingsRoutes } from './routes/settings.routes.js';
import { tasksRoutes } from './routes/tasks.routes.js';
export const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use(settingsRoutes);
app.use(tasksRoutes);
app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
});
