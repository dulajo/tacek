import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(row: any) {
  return {
    id: row.id,
    date: row.date,
    name: row.name ?? undefined,
    payerId: row.payerId,
    totalAmount: Number(row.totalAmount),
    tip: Number(row.tip),
    presentMemberIds: row.eventMembers?.map((em: { memberId: string }) => em.memberId) || [],
    selfPaidMemberIds: row.eventMembers
      ?.filter((em: { paidSelf: boolean }) => em.paidSelf)
      .map((em: { memberId: string }) => em.memberId) || [],
    presetItems: row.presetItems?.length
      ? row.presetItems.map((pi: { menuItemId: string; quantity: number }) => ({
          menuItemId: pi.menuItemId,
          quantity: pi.quantity,
        }))
      : undefined,
    status: row.status,
  };
}

const includeRelations = { eventMembers: true, presetItems: true } as const;

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      include: includeRelations,
      orderBy: { date: 'desc' },
    });
    res.json(events.map(mapEvent));
  } catch (e) { next(e); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json(mapEvent(event));
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, date, name, payerId, totalAmount, tip, presentMemberIds, selfPaidMemberIds, presetItems, status } = req.body;
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: { id, date: new Date(date), name, payerId, totalAmount, tip, status },
      });
      if (presentMemberIds?.length) {
        await tx.eventMember.createMany({
          data: presentMemberIds.map((memberId: string) => ({
            eventId: id,
            memberId,
            paidSelf: selfPaidMemberIds?.includes(memberId) || false,
          })),
        });
      }
      if (presetItems?.length) {
        await tx.eventPresetItem.createMany({
          data: presetItems.map((pi: { menuItemId: string; quantity: number }) => ({
            eventId: id,
            menuItemId: pi.menuItemId,
            quantity: pi.quantity,
          })),
        });
      }
      return tx.event.findUnique({ where: { id: created.id }, include: includeRelations });
    });
    res.status(201).json(mapEvent(event));
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.id as string;
    const { date, name, payerId, totalAmount, tip, presentMemberIds, selfPaidMemberIds, presetItems, status } = req.body;
    const event = await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: { date: new Date(date), name, payerId, totalAmount, tip, status },
      });
      await tx.eventMember.deleteMany({ where: { eventId } });
      if (presentMemberIds?.length) {
        await tx.eventMember.createMany({
          data: presentMemberIds.map((memberId: string) => ({
            eventId,
            memberId,
            paidSelf: selfPaidMemberIds?.includes(memberId) || false,
          })),
        });
      }
      await tx.eventPresetItem.deleteMany({ where: { eventId } });
      if (presetItems?.length) {
        await tx.eventPresetItem.createMany({
          data: presetItems.map((pi: { menuItemId: string; quantity: number }) => ({
            eventId,
            menuItemId: pi.menuItemId,
            quantity: pi.quantity,
          })),
        });
      }
      return tx.event.findUnique({ where: { id: eventId }, include: includeRelations });
    });
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json(mapEvent(event));
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    next(e);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.event.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
