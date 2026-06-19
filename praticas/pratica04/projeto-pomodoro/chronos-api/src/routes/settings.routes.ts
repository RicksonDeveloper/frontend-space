import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const defaultSettings = {
  workTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
};

function validateSettings(body: unknown) {
  if (!body || typeof body !== 'object') return null;

  const payload = body as Record<string, unknown>;
  const workTime = Number(payload.workTime);
  const shortBreakTime = Number(payload.shortBreakTime);
  const longBreakTime = Number(payload.longBreakTime);

  if (!Number.isInteger(workTime) || workTime < 1 || workTime > 99) return null;
  if (!Number.isInteger(shortBreakTime) || shortBreakTime < 1 || shortBreakTime > 30) return null;
  if (!Number.isInteger(longBreakTime) || longBreakTime < 1 || longBreakTime > 60) return null;

  return { workTime, shortBreakTime, longBreakTime };
}

router.get('/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, ...defaultSettings },
      select: {
        workTime: true,
        shortBreakTime: true,
        longBreakTime: true,
      },
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const data = validateSettings(req.body);

    if (!data) {
      res.status(400).json({
        message: 'Informe workTime, shortBreakTime e longBreakTime com valores numericos validos.',
      });
      return;
    }

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
      select: {
        workTime: true,
        shortBreakTime: true,
        longBreakTime: true,
      },
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export { router as settingsRoutes };
