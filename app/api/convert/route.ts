import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'mp3';

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json(
      { error: 'Invalid or missing YouTube URL' },
      { status: 400 }
    );
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/gi, ''); // Sanitize title

    const isAudio = format === 'mp3';

    // Choose streaming options based on format requested
    const filter = isAudio ? 'audioonly' : 'audioandvideo';
    const quality = isAudio ? 'highestaudio' : 'highest';
    const stream = ytdl(url, { quality, filter });

    const headers = new Headers();
    const filename = `${title}.${format}`;

    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');

    // Convert node stream to web stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    return new Response(webStream, { headers });
  } catch (error: unknown) {
    console.error('YTDL Error:', error);
    return NextResponse.json(
      { error: 'Failed to extract the video stream. YouTube may have restricted this video or the link is invalid.' },
      { status: 500 }
    );
  }
}
