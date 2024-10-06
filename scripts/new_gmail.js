// Usage
const userToken = process.env.USER_KEY;
const fs = require("node:fs");

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
async function fetchGmailEmails(token, maxResults = 100) {
    const baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
    const headers = { 'Authorization': `Bearer ${token}` };
    const emails = [];
  
    try {
      // Fetch list of email IDs
      const response = await fetch(`${baseUrl}?maxResults=1`, { headers });
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
//        console.log("BODY IS: ", body);
        return [body, html];
    }
    // Get the payload of the message
    const payload = message.payload;
    // Extract the raw body content
    const [rawBody, rawHTML] = getMessageBody(payload);
 //   console.log(rawHTML); // Find all URLs in the body using regex
    const urls = scrapeHyperlinks(rawHTML);
//    console.log("URLS ARE: ", urls);  
    return [rawBody, urls];
}





// EXECUTED:

// Add them to email.txt
fetchGmailEmails(userToken)
// print out the subject, sender, date/time, and content of each email
  .then(emails => {
      for (const email of emails) {
        for (const email of emails) {
            const subject = email.payload.headers.find(header => header.name === 'Subject').value;
            const sender = email.payload.headers.find(header => header.name === 'From').value;
            const dateTime = new Date(parseInt(email.internalDate));
            const [rawContent, links] = ContentAndURL(email);
  
            const emailData = {
                subject,
                sender,
                dateTime,
                links: links
            };
            const emailDataString = JSON.stringify(emailData, null, 2);

          fs.appendFile('metadata.txt', emailDataString + '\n', (err) => {
              if (err) {
                  console.error('Error appending email to file:', err);
              } else {
                  console.log('Email appended to file successfully.');
              }
          });
          fs.appendFile('content.txt', rawContent + '\n', (err) => {
              if (err) {
                  console.error('Error appending email to file:', err);
              } else {
                  console.log('Email appended to file successfully.');
              }
           });
    }
  }
  })
.catch(console.error);
