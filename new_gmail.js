const fs = require('fs');

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
  
// Usage
const userToken = process.env.USER_KEY; // Replace with actual token

// Add them to email.txt
fetchGmailEmails(userToken)
// print out the subject, sender, date/time, and content of each email
  .then(emails => {
      for (const email of emails) {
          const subject = email.payload.headers.find(header => header.name === 'Subject').value;
          const sender = email.payload.headers.find(header => header.name === 'From').value;
          const dateTime = new Date(parseInt(email.internalDate));
          const content = email.snippet;
          console.log('Subject:', subject);
          console.log('Sender:', sender);
          console.log('Date/Time:', dateTime);
          console.log('Content:', content);
          console.log('---');
          
          const emailData = {
              subject,
              sender,
              dateTime,
              content
          };
          const emailDataString = JSON.stringify(emailData);
          
          fs.appendFile('email.txt', emailDataString + '\n', (err) => {
              if (err) {
                  console.error('Error appending email to file:', err);
              } else {
                  console.log('Email appended to file successfully.');
              }
          });
          // append the entire response
          fs.appendFile('email.txt', JSON.stringify(email) + '\n', (err) => {
              if (err) {
                  console.error('Error appending email to file:', err);
              } else {
                  console.log('Email appended to file successfully.');
              }
          });
      }
  }
  )
  .catch(console.error);

  function extractLinksAndImages(payload) {
    const links = [];
    const images = [];
  
    function decodeBase64(data) {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  
    function extractFromPart(part) {
      if (part.mimeType === 'text/html') {
        const content = decodeBase64(part.body.data);
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
  
        // Extract links
        doc.querySelectorAll('a').forEach(a => {
          if (a.href) links.push(a.href);
        });
  
        // Extract images
        doc.querySelectorAll('img').forEach(img => {
          if (img.src) images.push(img.src);
        });
      }
  
      if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    }
  
    extractFromPart(payload);
  
    return { links, images };
  }
  
  // Usage example
  const messagePayload = {
    // ... Gmail API message payload
  };
  
  const { links, images } = extractLinksAndImages(messagePayload);
  console.log('Links:', links);
  console.log('Images:', images);


    