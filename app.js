const { google } = require('googleapis');
require('dotenv').config();


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const existingToken = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    scope: "https://www.googleapis.com/auth/drive",
    token_type: "Bearer",
    expires_in: 3599
};

oauth2Client.setCredentials(existingToken);

const drive = google.drive({ version: 'v3', auth: oauth2Client });



async function transferFileOwnership(fileId, newOwnerEmail) {
    try {
        const permissionList = await drive.permissions.list({
            fileId,
            supportsAllDrives: true,
            fields: "*",
        });

        const permission = permissionList.data.permissions.find(
            ({ emailAddress }) => emailAddress == newOwnerEmail
        );

        if (permission) {
            throw new Error("User already have permission")
        }

        const permissionResponse = await drive.permissions.create({
            fileId: fileId,
            sendNotificationEmail: true,
            supportsAllDrives: true,
            requestBody: {
                role: "writer",
                type: "user",
                emailAddress: newOwnerEmail,
            },
        });

        const permissionId = permissionResponse.data.id
        await drive.permissions.update({
            fileId,
            permissionId,
            supportsAllDrives: true,
            requestBody: {
                role: "writer",
                pendingOwner: true,
            },
        });


    } catch (error) {
        console.error('Error transferring ownership:', error.message);
    }
}

transferFileOwnership('1sb1Q_vTfuFZ9YLdmJYljfiFx6SVDS668', 'vjacoballen2040@gmail.com');


