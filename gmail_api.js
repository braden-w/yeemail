const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Loads saved credentials from token.json if it exists.
 * @returns {Promise<google.auth.OAuth2|null>} The loaded client or null if token.json does not exist.
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Saves the client credentials to token.json.
 * @param {google.auth.OAuth2} client The authenticated client.
 * @returns {Promise<void>} A Promise that resolves when the credentials are saved.
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Authorizes the user and returns an authenticated client.
 * If saved credentials exist, it loads them from token.json.
 * Otherwise, it prompts the user to authenticate and saves the credentials to token.json.
 * @returns {Promise<google.auth.OAuth2>} A Promise that resolves with the authenticated client.
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the labels in the user's Gmail account.
 * @param {google.auth.OAuth2} auth The authenticated client.
 * @returns {Promise<void>} A Promise that resolves when the labels are listed.
 */
async function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
        console.log('No labels found.');
        return;
    }
    console.log('Labels:');
    labels.forEach((label) => {
        console.log(`- ${label.name}`);
    });
}

authorize().then(listLabels).catch(console.error);

/**
 * Reads an individual email and extracts the subject, date, sender, and content.
 * @param {google.auth.OAuth2} auth The authenticated client.
 * @param {string} emailId The ID of the email to read.
 * @returns {Promise<void>} A Promise that resolves when the email is read and the information is extracted.
 */
async function readEmail(auth, emailId) {
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.messages.get({
        userId: 'me', // The user's email address. The special value 'me' can be used to indicate the authenticated user.
        maxResults: 50, // The maximum number of messages to return.
        id: emailId,
        format: 'full',
    });

    const email = res.data; // JSON object representing the email.
    const headers = email.payload.headers;
    const subject = headers.find(header => header.name === 'Subject').value;
    const date = headers.find(header => header.name === 'Date').value;
    const sender = headers.find(header => header.name === 'From').value;
    const content = getEmailContent(email);

    console.log('Subject:', subject);
    console.log('Date:', date);
    console.log('Sender:', sender);
    console.log('Content:', content);
}

/**
 * Extracts the content of an email.
 * @param {object} email The email object, JSON format. 
 * @returns {string} The content of the email.
 */
function getEmailContent(email) {
    if (email.payload.parts && email.payload.parts.length > 0) {
        const parts = email.payload.parts;
        const body = parts.find(part => part.mimeType === 'text/plain');
        if (body) {
            return body.body.data ? Buffer.from(body.body.data, 'base64').toString() : '';
        }
    }
    return '';
}

// Example usage:
// authorize().then(auth => readEmail(auth, 'emailId')).catch(console.error);

const filePath = path.join(process.cwd(), 'email.txt');

/**
 * Stores the email information in a text file.
 * @param {string} filePath The path of the text file to store the information.
 * @param {string} subject The subject of the email.
 * @param {string} date The date of the email.
 * @param {string} sender The sender of the email.
 * @param {string} content The content of the email.
 * @returns {Promise<void>} A Promise that resolves when the information is stored in the text file.
 */
async function storeEmailInformation(filePath, subject, date, sender, content) {
    const emailInformation = `Subject: ${subject}\nDate: ${date}\nSender: ${sender}\nContent: ${content}`;
    await fs.writeFile(filePath, emailInformation);
}

// Example usage:
// authorize().then(auth => readEmail(auth, 'emailId')).then(({subject, date, sender, content}) => {
//     const filePath = '/path/to/email.txt';
//     return storeEmailInformation(filePath, subject, date, sender, content);
// }).catch(console.error);