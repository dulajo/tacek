import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' } });
    res.json(members.map(m => ({
      id: m.id,
      name: m.name,
      isCore: m.isCore,
      revolutUsername: m.revolutUsername ?? undefined,
      bankAccount: m.bankAccount ?? undefined,
    })));
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, isCore, revolutUsername, bankAccount } = req.body;
    const member = await prisma.member.create({
      data: { id, name, isCore, revolutUsername, bankAccount },
    });
    res.status(201).json(member);
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, isCore, revolutUsername, bankAccount } = req.body;
    const member = await prisma.member.update({
      where: { id },
      data: { name, isCore, revolutUsername, bankAccount },
    });
    res.json(member);
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    next(e);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.member.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
