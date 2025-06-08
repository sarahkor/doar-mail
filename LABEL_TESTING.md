# Label Functionality Testing Guide

## Setup

### 1. Start the Node.js Web Server
```bash
cd src/web_server
npm install
node app.js
```

You should see:
```
Server is running on http://localhost:8080
Auth bypass enabled for development
```

### 2. Start the React Client
Open a new terminal:
```bash
cd src/client/gmail-client
npm install
npm start
```

The React app will open at `http://localhost:3000`

## Test the Label Functionality

### Via Browser (React Frontend)
1. Go to `http://localhost:3000`
2. Look for the "Labels" sidebar section
3. Click the "+" button to create a new label
4. Try creating, editing, deleting, and changing colors of labels

### Via API (Backend Testing)
```bash
cd src/web_server
node test-labels.js
```

## Expected Behavior

### ✅ What Should Work:
- **Create Labels**: Click + button, enter name, click Create
- **Edit Labels**: Click ⋮ menu on label → Edit → Change name
- **Delete Labels**: Click ⋮ menu on label → Remove label
- **Change Colors**: Click ⋮ menu on label → Label color → Pick a color
- **View Labels**: All labels should persist during the session

### ⚠️ Current Limitations:
- **No Persistence**: Labels are lost when the Node.js server restarts (in-memory only)
- **No Real Authentication**: Using dev auth bypass with hardcoded user
- **No Nested Labels**: Backend doesn't support parent/child relationships yet

## API Endpoints

All require header: `id: dev-user`

- `GET /api/labels` - Get all labels
- `POST /api/labels` - Create label `{ name: "string", color: "string" }`
- `PATCH /api/labels/:id` - Update label `{ name?: "string", color?: "string" }`
- `DELETE /api/labels/:id` - Delete label

## Troubleshooting

### CORS Issues
If you see CORS errors, make sure the Node.js server is running and has CORS enabled.

### 401 Unauthorized
The API requires the `id: dev-user` header. Check if it's being sent.

### Labels Not Appearing
Check browser console for errors. Make sure both servers are running. 