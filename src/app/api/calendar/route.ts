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
      
      // 日付文字列をタイムゾーンを考慮して解析
      const startDateTime = new Date(date);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDateTime = new Date(date);
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      // タイムゾーンを考慮したISOString形式に変換
      const startISO = new Date(
        startDateTime.getTime() - (startDateTime.getTimezoneOffset() * 60000)
      ).toISOString();
      
      const endISO = new Date(
        endDateTime.getTime() - (endDateTime.getTimezoneOffset() * 60000)
      ).toISOString();

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
