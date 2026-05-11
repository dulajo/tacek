import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import membersRouter from './routes/members.js';
import menuItemsRouter from './routes/menuItems.js';
import eventsRouter from './routes/events.js';
import consumptionsRouter from './routes/consumptions.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/menu-items', menuItemsRouter);
app.use('/api/events', eventsRouter);
app.use('/api', consumptionsRouter);

app.post('/api/clear-all', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$transaction([
      prisma.consumptionSharedItem.deleteMany(),
      prisma.consumptionItem.deleteMany(),
      prisma.memberConsumption.deleteMany(),
      prisma.eventPresetItem.deleteMany(),
      prisma.eventMember.deleteMany(),
      prisma.event.deleteMany(),
      prisma.menuItem.deleteMany(),
      prisma.member.deleteMany(),
    ]);
    res.status(204).send();
  } catch (e) { next(e); }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
