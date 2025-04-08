import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// ✅ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ Updated GET route — no second argument allowed
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Gets the last segment (your [id])

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const isusu = await prisma.isusu.findUnique({ where: { id } });

        if (!isusu) {
            return NextResponse.json({ error: 'Isusu not found' }, { status: 404 });
        }

        return NextResponse.json(isusu);
    } catch (error) {
        console.error('GET isusu error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const isusuName = formData.get('isusuName') as string;
        const milestone = parseFloat(formData.get('milestone') as string);
        const frequency = formData.get('frequency') as string;
        const isusuClass = formData.get('isusuClass') as string;
        const imageFile = formData.get('groupImage') as File | null;

        const currentIsusu = await prisma.isusu.findUnique({ where: { id } });

        if (!currentIsusu) {
            return NextResponse.json({ error: 'Isusu not found' }, { status: 404 });
        }

        let imageUrl = currentIsusu.isusuImage;

        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadResult = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream({ folder: 'isusu_images' }, (err, result) => {
                        if (err || !result) return reject(err || new Error('Upload failed'));
                        resolve(result.secure_url);
                    })
                    .end(buffer);
            });

            imageUrl = uploadResult;
        }

        const updatedIsusu = await prisma.isusu.update({
            where: { id },
            data: {
                isusuName,
                milestone,
                frequency,
                isusuClass,
                tier: currentIsusu.tier,
                isusuImage: imageUrl,
            },
        });

        return NextResponse.json(updatedIsusu, { status: 200 });
    } catch (error) {
        console.error('PUT isusu error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
