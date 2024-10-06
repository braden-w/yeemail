// Usage
const userToken = process.env.USER_KEY;
const fs = require("node:fs");
const { createMultipleEmails } = require('src/lib/api/emails/mutations');
const { createEmail } = require('src/lib/api/emails/mutations');
const { content } = require("googleapis/build/src/apis/content");
const { max } = require("drizzle-orm");

// Helper function to decode base64 URL-safe encoding
function decodeBase64(data) {
	try {
		return atob(data.replace(/_/g, "/").replace(/-/g, "+"));
	} catch (e) {
		console.error("Error decoding base64 data: ", e);
		return "";
	}
}

// Fetch emails from Gmail API
async function fetchGmailEmails(token, maxResults = 75) {
    const baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
    const headers = { 'Authorization': `Bearer ${token}` };
    const emails = [];
    
    // Cap max results at 75
    if (maxResults > 75) {
        console.error("Error: maxResults must be less than or equal to 100.");
        maxResults = 75;
    }

    try {
      // Fetch list of email IDs
      const response = await fetch(`${baseUrl}?maxResults=${ maxResults }`, { headers });
      if (!response.ok) {
        throw new Error(`Error fetching email list: ${response.status} ${await response.text()}`);
      }
  
      const data = await response.json();
      const messages = data.messages || [];
  
      // Fetch email details for each ID
      for (const msg of messages) {
        const emailId = msg.id;
        const emailUrl = `${baseUrl}/${emailId}`;
        const emailResponse = await fetch(emailUrl, { headers });
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          emails.push(emailData); // Add email data to the list
        } else {
          console.error(`Error fetching email ${emailId}: ${emailResponse.status}`);
        }
      }
      return emails;

    } catch (error) {
      console.error('Error:', error.message);
      return [];
    }
  }
  
function ContentAndURL(message) {
  // HTML scraper function to search for hyperlinks
    function scrapeHyperlinks(html) {
        const urlRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
        const links = [];
        let match;
        
        while ((match = urlRegex.exec(html)) !== null) {
            const url = match[2];
            links.push(url);
        }
        return links;
    }
    // Helper function to extract raw message parts (text/plain or text/html)
    function getMessageBody(payload) {
        let body = '';
        let html = '';
        if (payload.parts) {
            for (let i = 0; i < payload.parts.length; i++) {
                const part = payload.parts[i];
                if (part.parts) {
                    // Recursively extract parts if there are nested parts
                    body += getMessageBody(part);
                } 
                else if (part.mimeType === 'text/plain') {
                    if (part.body && part.body.data) {
                        body += decodeBase64(part.body.data);
                    }
                }
                else if (part.mimeType === 'text/html') {
                    if (part.body && part.body.data) {
                        html += decodeBase64(part.body.data);
                    }
                }
            }
        } else if (payload.body && payload.body.data) {
            // If there's no 'parts', just grab the data from the payload body
            body = decodeBase64(payload.body.data);
        }
        return [body, html];
    }
    // Get the payload of the message
    const payload = message.payload;
    const [rawBody, rawHTML] = getMessageBody(payload);
    const urls = scrapeHyperlinks(rawHTML);
    return [rawBody, urls];
}

function formatEmailJSON(emails) {
    const emailData = [];
    for (const email of emails) {
        const subject = email.payload.headers.find(header => header.name === 'Subject').value;
        const sender = email.payload.headers.find(header => header.name === 'From').value;
        const dateTime = new Date(parseInt(email.internalDate));
        const [rawContent, links] = ContentAndURL(email);
        const formatted = {
            subject,
            content: rawContent,
            sender,
            receivedAt: dateTime,
            links: JSON.stringify(links)
        }
        emailData.push(formatted);
    }
    return emailData;
}

async function insertAllEmails(userToken, maxResults) {
  if (maxResults > 75) {
    console.error('Error: Max results must be less than or equal to 75.');
    maxResults = 75;
  }
  if (!userToken) {
    console.error('Error: User token is required.');
    return;
  }
  // Fetch emails from Gmail API
  const emails = await fetchGmailEmails(userToken, maxResults)

  // print out the subject, sender, date/time, and content of each email
  .then(emails => {
    const emailData = formatEmailJSON(emails);
    // console.log(emailData);
    const insertedCount = createMultipleEmails(emailData)
      .then(() => {
        console.log(`${ insertedCount } emails inserted successfully.`);
      })
      .catch(console.error);
  })
  .catch(console.error)
  };


async function insertOneEmail(userToken) {
  if (!userToken) {
    console.error('Error: User token is required.');
    return;
  }
  // Fetch emails from Gmail API
  const emails = await fetchGmailEmails(userToken, 1)

  // print out the subject, sender, date/time, and content of each email
  .then(emails => {
    const emailData = formatEmailJSON(emails);
    const insertedCount = createEmail(emailData[0])
      .then(() => {
        console.log(`${ insertedCount } emails inserted successfully.`);
      })
      .catch(console.error);
  })
  .catch(console.error)
  }

// Usage
insertAllEmails(userToken, 2);
//insertOneEmail(userToken);