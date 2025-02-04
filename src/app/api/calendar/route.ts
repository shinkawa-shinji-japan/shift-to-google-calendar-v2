import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/lib/auth';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { title, startTime, endTime, dates, calendarId, timeZone, colorId } = await request.json();

    if (!title || !startTime || !endTime || !dates || dates.length === 0 || !calendarId || !timeZone || !colorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
      refresh_token: session.refreshToken as string,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = [];

    for (const date of dates) {
      const [hours, minutes] = startTime.split(':');
      const [endHours, endMinutes] = endTime.split(':');
      
      let startDateTime = new Date(date);
      let endDateTime = new Date(date);

      // ファミリーカレンダー(UTCタイムゾーン固定)の場合は、日本時間からUTCに変換
      if (calendarId.includes('family')) {
        // 日本時間の時刻をUTCとして設定(-9時間)
        startDateTime.setUTCHours(parseInt(hours) - 9, parseInt(minutes), 0, 0);
        endDateTime.setUTCHours(parseInt(endHours) - 9, parseInt(endMinutes), 0, 0);
      } else {
        // 他のカレンダーの場合は通常通り
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      }

      const startISO = startDateTime.toISOString();
      const endISO = endDateTime.toISOString();

      const event = {
        summary: title,
        start: {
          dateTime: startISO,
          timeZone: timeZone,
        },
        end: {
          dateTime: endISO,
          timeZone: timeZone,
        },
        colorId: colorId,
      };

      events.push(
        calendar.events.insert({
          calendarId,
          requestBody: event,
        })
      );
    }

    await Promise.all(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to create events' },
      { status: 500 }
    );
  }
}
