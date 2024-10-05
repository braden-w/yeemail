async function fetchGmailEmails(token, maxResults = 100) {
    const baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
    const headers = { 'Authorization': `Bearer ${token}` };
    const emails = [];
  
    try {
      // Fetch list of email IDs
      const response = await fetch(`${baseUrl}?maxResults=${maxResults}`, { headers });
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
          emails.push(emailData);
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
  const userToken = 'YOUR_GOOGLE_USER_TOKEN'; // Replace with actual token
  fetchGmailEmails(userToken)
    .then(fetchedEmails => {
      console.log(`Number of emails fetched: ${fetchedEmails.length}`);
    })
    .catch(error => {
      console.error('Error fetching emails:', error);
    });