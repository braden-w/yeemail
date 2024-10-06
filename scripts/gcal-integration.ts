import { db } from "@/lib/db";
import { sum } from "drizzle-orm";
const userToken = process.env.USER_KEY;
const allEvents = await db.query.suggestedEvents.findMany();

console.log(allEvents);

const { google } = require('googleapis');

const events = [{summary: 'Potential Event',
    description: 'This is a potential event that needs your approval.',
    start: {
      dateTime: '2024-10-06T09:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2024-10-06T17:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    }},{summary: 'Potential Event 2',
        description: 'This is a potential event that needs your approval.',
        start: {
          dateTime: '2024-10-07T09:00:00-07:00',
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: '2024-10-07T17:00:00-07:00',
          timeZone: 'America/Los_Angeles',
        }}];

async function createPotentialEvent(userToken, events) {
    // Create a new OAuth2 client with the provided user key
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken });
  
    // Create a Calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Collect all created events
    const createdEvents = [];
  
    // Loop through each event in the events array
    for (let description of events) {
      const event = {
        summary: description.summary,
        description: description.description,
        start: description.start,
        end: description.end,
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
        createdEvents.push(res.data);  // Collect created events
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    }
    return createdEvents;  // Return all created events after the loop
  }
  
  // Usage
  createPotentialEvent(userToken, events)
    .then(createdEvents => {
      console.log('All events created successfully');
    })
    .catch(error => {
      console.error('Failed to create events:', error);
    });