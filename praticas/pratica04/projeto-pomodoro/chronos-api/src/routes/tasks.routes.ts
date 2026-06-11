import { Router } from 'express';
import { Prisma, TaskType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const router = Router();
const taskTypes = new Set<string>(Object.values(TaskType));

function parseTimestamp(value: unknown) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? BigInt(numberValue) : null;
}

function serializeTask(task: {
  id: string;
  name: string;
  duration: number;
  type: TaskType;
  startDate: bigint;
  completeDate: bigint | null;
  interruptDate: bigint | null;
}) {
  return {
    ...task,
    startDate: Number(task.startDate),
    completeDate: task.completeDate === null ? null : Number(task.completeDate),
    interruptDate: task.interruptDate === null ? null : Number(task.interruptDate),
  };
}

router.get('/tasks', async (_req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { startDate: 'desc' },
    });

    res.json(tasks.map(serializeTask));
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const { id, name, duration, type } = req.body as Record<string, unknown>;
    const startDate = parseTimestamp(req.body?.startDate);
    const numericDuration = Number(duration);

    if (
      typeof id !== 'string' ||
      id.trim().length === 0 ||
      typeof name !== 'string' ||
      name.trim().length === 0 ||
      !Number.isInteger(numericDuration) ||
      numericDuration < 1 ||
      typeof type !== 'string' ||
      !taskTypes.has(type) ||
      startDate === null
    ) {
      res.status(400).json({ message: 'Payload de task invalido.' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        id,
        name: name.trim(),
        duration: numericDuration,
        type: type as TaskType,
        startDate,
      },
    });

    res.status(201).json(serializeTask(task));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ message: 'Ja existe uma task com esse id.' });
      return;
    }

    next(error);
  }
});

router.patch('/tasks/:id/complete', async (req, res, next) => {
  try {
    const completeDate = parseTimestamp(req.body?.completeDate);

    if (completeDate === null) {
      res.status(400).json({ message: 'Informe completeDate valido.' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { completeDate, interruptDate: null },
    });

    res.json(serializeTask(task));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Task nao encontrada.' });
      return;
    }

    next(error);
  }
});

router.patch('/tasks/:id/interrupt', async (req, res, next) => {
  try {
    const interruptDate = parseTimestamp(req.body?.interruptDate);

    if (interruptDate === null) {
      res.status(400).json({ message: 'Informe interruptDate valido.' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { interruptDate, completeDate: null },
    });

    res.json(serializeTask(task));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Task nao encontrada.' });
      return;
    }

    next(error);
  }
});

router.delete('/tasks', async (_req, res, next) => {
  try {
    await prisma.task.deleteMany();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as tasksRoutes };
