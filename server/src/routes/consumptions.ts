import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router: Router = Router();

router.get('/events/:eventId/consumptions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const rows = await prisma.memberConsumption.findMany({
      where: { eventId },
      include: { items: true, sharedItems: true },
    });
    res.json(rows.map(row => ({
      eventId: row.eventId,
      memberId: row.memberId,
      items: row.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      sharedItemIds: row.sharedItems.map(s => s.menuItemId),
      paidEntryFeeForIds: [],
      hasPaid: row.hasPaid,
      totalAmount: Number(row.totalAmount),
    })));
  } catch (e) { next(e); }
});

router.put('/events/:eventId/consumptions/:memberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const memberId = req.params.memberId as string;
    const { hasPaid, totalAmount, items, sharedItemIds } = req.body;
    await prisma.$transaction(async (tx) => {
      const consumption = await tx.memberConsumption.upsert({
        where: { eventId_memberId: { eventId, memberId } },
        create: { eventId, memberId, hasPaid, totalAmount },
        update: { hasPaid, totalAmount },
      });
      const consumptionId = consumption.id;
      await tx.consumptionItem.deleteMany({ where: { consumptionId } });
      await tx.consumptionSharedItem.deleteMany({ where: { consumptionId } });
      if (items?.length) {
        await tx.consumptionItem.createMany({
          data: items.map((i: { menuItemId: string; quantity: number }) => ({
            consumptionId,
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
        });
      }
      if (sharedItemIds?.length) {
        await tx.consumptionSharedItem.createMany({
          data: sharedItemIds.map((menuItemId: string) => ({
            consumptionId,
            menuItemId,
          })),
        });
      }
    });
    res.status(200).json({ success: true });
  } catch (e) { next(e); }
});

router.delete('/events/:eventId/consumptions/:memberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const memberId = req.params.memberId as string;
    const consumption = await prisma.memberConsumption.findUnique({
      where: { eventId_memberId: { eventId, memberId } },
    });
    if (consumption) {
      await prisma.memberConsumption.delete({ where: { id: consumption.id } });
    }
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
