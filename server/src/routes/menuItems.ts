import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.menuItem.findMany({ orderBy: { name: 'asc' } });
    res.json(items.map(i => ({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      category: i.category,
      isShared: i.isShared,
      isFavorite: i.isFavorite,
    })));
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, price, category, isShared, isFavorite } = req.body;
    const item = await prisma.menuItem.create({
      data: { id, name, price, category, isShared, isFavorite: isFavorite || false },
    });
    res.status(201).json({ ...item, price: Number(item.price) });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, price, category, isShared, isFavorite } = req.body;
    const item = await prisma.menuItem.update({
      where: { id },
      data: { name, price, category, isShared, isFavorite: isFavorite || false },
    });
    res.json({ ...item, price: Number(item.price) });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    next(e);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.menuItem.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
