import sharp from 'sharp';

export async function addTimestampToImage(imageBuffer: Buffer, timestamp: string): Promise<Buffer> {
    const svgText = `
        <svg width="400" height="50">
            <style>
                .title { fill: #ffffff; font-size: 20px; font-family: Arial, sans-serif; font-weight: bold; }
            </style>
            <text x="10" y="30" class="title">${timestamp}</text>
        </svg>
    `;

    const svgBuffer = Buffer.from(svgText);

    const compositeImage = await sharp(imageBuffer)
        .composite([{ input: svgBuffer, top: 10, left: 10 }])
        .jpeg()
        .toBuffer();

    return compositeImage;
}
