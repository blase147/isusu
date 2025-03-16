import { PrismaClient } from '@prisma/client';
import tiers from './../../../lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface Tier {
    name: string;
    // Add other properties of the tier if available
}

interface Group {
    id: string;
    tier: string;
    // Add other properties of the group if available
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };

    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const group: Group | null = await prisma.isusu.findUnique({
        where: { id },
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Find the tier settings by matching the name
    const tierSettings: Tier | undefined = tiers.find(t => t.name === group.tier);

    res.json({ ...group, tierSettings });
}
