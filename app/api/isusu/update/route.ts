import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";  // Keep it if you're using it for session/authentication

const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const isusu = await prisma.isusu.findUnique({
            where: { id },
        });

        if (!isusu) {
            return NextResponse.json({ error: 'Isusu not found' }, { status: 404 });
        }

        return NextResponse.json(isusu);
    } catch (error) {
        console.error('GET isusu error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Example of using auth to check if the user is authenticated
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    // Ensure user is authenticated
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const isusuName = formData.get('isusuName') as string;
        const tier = formData.get('tier') as string;
        const milestone = parseFloat(formData.get('milestone') as string);
        const frequency = formData.get('frequency') as string;
        const isusuClass = formData.get('isusuClass') as string;

        const imageFile = formData.get('groupImage') as File | null;

        let imageUrl: string | undefined;

        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const imageName = `${uuidv4()}_${imageFile.name}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            await writeFile(path.join(uploadDir, imageName), buffer);
            imageUrl = `/uploads/${imageName}`;
        }

        const updatedIsusu = await prisma.isusu.update({
            where: { id },
            data: {
                isusuName,
                tier,
                milestone,
                frequency,
                isusuClass,
                ...(imageUrl && { groupImage: imageUrl }),
            },
        });

        return NextResponse.json(updatedIsusu, { status: 200 });
    } catch (error) {
        console.error('PUT isusu error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
