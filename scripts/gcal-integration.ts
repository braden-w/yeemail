import { db } from "@/lib/db";
const userToken = process.env.USER_KEY;
const allEvents = await db.query.suggestedEvents.findMany();

console.log(allEvents);

const { google } = require('googleapis');

async function createPotentialEvent(userToken) {
  // Create a new OAuth2 client with the provided user key
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: userToken });

  // Create a Calendar client
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Define the event details
  const event = {
    summary: 'Potential Event',
    description: 'This is a potential event that needs your approval.',
    start: {
      dateTime: '2024-10-06T09:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2024-10-06T17:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    status: 'tentative',
    attendees: [
      { email: 'bmw02002turbo@gmail.com', self: true }
    ]
  };

  try {
    // Insert the event
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Potential event created:', res.data.htmlLink);
    return res.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Usage
createPotentialEvent(userToken)
  .then(createdEvent => {
    console.log('Event created successfully:', createdEvent);
  })
  .catch(error => {
    console.error('Failed to create event:', error);
  });