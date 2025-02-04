import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/lib/auth';
import { google } from 'googleapis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
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
    
    const response = await calendar.calendarList.list();
    const calendars = response.data.items?.map(calendar => ({
      id: calendar.id,
      summary: calendar.summary,
      description: calendar.description,
      primary: calendar.primary,
      backgroundColor: calendar.backgroundColor,
    })) || [];

    // プライマリーカレンダーを先頭に
    calendars.sort((a, b) => {
      if (a.primary) return -1;
      if (b.primary) return 1;
      return 0;
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar list' },
      { status: 500 }
    );
  }
}
