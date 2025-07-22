# 🖥️ Frontend Features and Usage Guide
This section provides an overview of the core user-facing features in the Doar React + Android clients, focusing on the interface functionality and user experience.
The section also shows how to use each feature with web and android picture examples

## 🔐 Login & Register Flow

Users can register by providing:

- Username (that must end with @doar.com

- Password that must meet the password requirements ( at least 8 characters, upper case letter, etc...)

- First & (Optionally) last name

- birthday (the user must be at least 13 years old)

- phone number (in an Israeli format)

- gender

- profile picture

- To register press the create Doar account button on the login page (the page the app is starting at)

Users can login by providing:

- Username (with or without the @doar.com ending)

- Password

Upon successful login, the user receives a JWT token.

The token is stored locally and used for authenticated requests.

### web app:

registering -

<img width="1440" alt="Screenshot 2025-06-18 at 17 46 59" src="https://github.com/user-attachments/assets/569b603f-77f2-492f-b19f-fe49106b552a" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 47 18" src="https://github.com/user-attachments/assets/752fd9bf-c439-477d-a12f-1af46e4761a7" />

logging in - 

<img width="1440" alt="Screenshot 2025-06-18 at 17 47 40" src="https://github.com/user-attachments/assets/286d69a7-6520-4cec-ab3d-418f699302d2" />

### android:

registering - 

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/f87845c4-8911-4269-b24f-bac3acff152d" />

logging in -

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/7875478a-cde9-4e68-810f-bc2eba7f49e5" />

## 📬 Mail Categories
Once logged in, users can access various categories through the sidebar navigation.

### in the web app:

<img width="1440" alt="Screenshot 2025-06-18 at 17 49 52" src="https://github.com/user-attachments/assets/f75960ae-b74d-46ab-82d6-5ffb8e29433c" />

### in android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/fb0e2a11-5823-4678-a98e-b89a09a8a70e" />


## ✉️ Inbox
- Shows all received mails that are not marked as spam or deleted.

- Unread mails are visually distinguished.

### web: 

<img width="1440" alt="Screenshot 2025-06-18 at 17 50 47" src="https://github.com/user-attachments/assets/0784fe64-cc01-4685-9823-67e90ae90b3b" />

### android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/3417e537-9b4a-47a1-9461-e31f844e28f6" />

## 📤 Sent
Displays all mails successfully sent from me.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 50 53" src="https://github.com/user-attachments/assets/6b69b34b-dfb6-4102-b985-27cc2b087caf" />

### android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/8b4d2175-4c3b-4fc4-a62a-1584ea6b183b" />


## 📝 Drafts
- Mails saved but not sent yet.

- Drafts can be re-opened, edited, and resent.

- In order to save a mail as draft press the cancel button in web, and the x button in android. please notice that the fields needs to be valid for the mail to be save as draft. mail can also be discarded by pressing the trash icon in the compose dialog.

- To edit a draft click the draft item and the compose dialog will get opened, there you can edit the mail subject and body, add attachments, and send the mail.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 53 37" src="https://github.com/user-attachments/assets/3f134f63-0bd8-4c97-9203-c6fab8c9f6e5" />

### android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/b4e2488f-2bb7-49d3-9505-4d0545e950eb" />

## ⭐ Starred
- Mails that the user manually marked as important.

- Can be toggled from mail list or from the full view of the mail.

- to mark mail starred press on the star icon.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 53 12" src="https://github.com/user-attachments/assets/7fc9a790-b1ee-45ac-a164-3b2946f9cc60" />

### android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/566f969f-1869-411a-aedf-95a29a2dc0ae" />

## 🗑️ Trash
- Mails deleted by the user.

- Can be restored or permanently deleted.

- To move a mail to the trash press on the trash icon in any of the folders it exists at, to permanently delete a mail press the trash icon when the mail is in the trash folder.

- In order to restore a mail from trash press the restore icon next to the trash icon when the mail is in the trash folder.

- If a mail is restored it will be moved back to its original folder (or folders)

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 54 25" src="https://github.com/user-attachments/assets/530f7537-6276-45d2-90c5-8b8dd5342b36" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 32" src="https://github.com/user-attachments/assets/8b8afe46-2a87-4702-b0d1-df8969b6a9f8" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 39" src="https://github.com/user-attachments/assets/7b0d275b-8a11-4735-b2ac-5a75749cdf85" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 46" src="https://github.com/user-attachments/assets/73434f2f-7660-430a-bd3b-c3bb4d01481b" />

### android:

<img width="299" height="545" alt="image" src="https://github.com/user-attachments/assets/294ba4bc-b39a-4ce8-9c8e-988d0c476d46" />


## 🚫 Spam

- Mails flagged as spam due to blacklisted URLs.

- Can be marked/unmarked as spam in the spam icon, if the mail is already in spam the spam icon will automatically will be changed to the restore icon.

- When a mail is marked as spam it moves to spam folders and all the urls that where in the mail are getting blacklisted.

- When a mail has blacklisted urls it is automatically moves to spam in the receiver door account.

- When a mail is marked as un-spam all the urls in it are removed from blacklist.

- To mark a mail as spam press the spam icon on the mail list or on the mail full view.

- To mark a mail as un-spam press the un spam icon on the mail list or on the mail full view (the icon will automatically replace the spam icon when the mail is marked spam.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 18 00 35" src="https://github.com/user-attachments/assets/f1fda402-7ade-41ef-8f61-c62ee3211f90" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 00 44" src="https://github.com/user-attachments/assets/ef8a9c25-0981-464f-9c4a-05107fb41b39" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 00 57" src="https://github.com/user-attachments/assets/2d9ebc31-939c-4945-a8b6-3876c07096ee" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 38" src="https://github.com/user-attachments/assets/9c4e1fd2-4c48-47b3-ad6c-ebc0e3c6ea06" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 48" src="https://github.com/user-attachments/assets/12ca6926-75ee-4cbc-b66c-60f164b6fc75" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 58" src="https://github.com/user-attachments/assets/1775a1c6-50ea-432b-b386-cfbb767dfde3" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 03 00" src="https://github.com/user-attachments/assets/c559576d-e488-4411-9787-379b1bcfa973" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/08e7d41f-ba84-4a88-8c6f-bfce6397a818" />

## 📂 All Mail
A combined view of inbox, sent, and drafts.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 53 43" src="https://github.com/user-attachments/assets/4802478c-0cc2-4ee4-8c6b-267ace6382bf" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/26857989-86b5-4de5-a9fa-4e34acb62940" />


## 🖊️ Mail Compose

- Users can write a new email using the Compose page:

  - Fields: To, Subject, Body (in android all fields are required, in the web the 'To' field is required).

  - File attachment support via upload picker (in web)

- Drafts auto-save if user navigates away (in web when pressing cancel, in android when pressing the x icon, in both web and android the fields have to be valid).

- Sent mails are added to sender’s Sent folder and receiver’s Inbox, unless the mail contains blacklisted url then it's added to receiver’s Spam.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 50 20" src="https://github.com/user-attachments/assets/39215994-f3fe-42d5-8c6c-76c7b769788c" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/6a74d3f0-9401-4c01-b757-2e72d4dcefc7" />

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/ecc7694a-ebd2-4d85-962c-e35b74bc5d5d" />


## 📎 File Upload
- Attachments are uploaded via the frontend and sent to the server as Base64 strings.

- Supported file types: Any.

- Files can be attached only from web but can be seen also from the android.

- To attach a file press on the attachment icon in the compose dialog.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 51 44" src="https://github.com/user-attachments/assets/8063c32b-121d-4112-91c9-11fc58e22981" />

<img width="1440" alt="Screenshot 2025-06-18 at 17 52 05" src="https://github.com/user-attachments/assets/081f352c-bf12-4c09-acfd-6c2ed347b79d" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/6cefbdc6-3d83-4bd4-af88-c529a6c31239" />


## 🔍 Search Functionality

- Located at the top of the UI

- Performs case-insensitive matching of:

  - Subject

  - Body

  - Sender/recipient

- In the web: returns a filtered list across inbox, sent, and drafts

- In android it search the mail in the folder you are currently at.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 18 03 46" src="https://github.com/user-attachments/assets/aaa0ba28-8468-48b9-99e4-85b1eef6a42e" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/236e1bfd-983b-4f98-8059-75c3cba304b1" />


## 🏷️ Label System
- Users can:

  - Create custom labels with names & colors

  - Assign labels to specific mails

  - View mails by label

- Labels are fully editable and deletable

- Labels sync across devices

- To create a new label press on the plus icon on the top of the labels side bar.

- to edit  or remove a label press the 3 dots icon in the label item right.

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 17 55 38" src="https://github.com/user-attachments/assets/cef2b282-395a-4c2a-8c15-f870cf3847b7" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 55 45" src="https://github.com/user-attachments/assets/efd6e023-6953-4db8-b560-02d1f8ca43b9" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 59 55" src="https://github.com/user-attachments/assets/b94f7118-4245-4cb6-afd0-501b9ee4c3ff" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/5ff620ef-81ea-42ca-b5da-982d6db96218" />

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/40bf13d5-eebd-4dbb-b1f1-7449befef8c0" />

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/41a1085f-9e04-4706-a687-e4fbd44b8d55" />


## 🌗 Dark/Light Mode Handling

- Fully supports system dark mode:

  - in android: Automatically detects system setting 
  - in web: When pressing the dark/light icon at the top right, the theme is switched between dark and light.
  - UI adjusts color scheme accordingly

- Ensures text remains readable in both themes

- Backgrounds, cards, and buttons respond to Material Theme system

### web:

<img width="1440" alt="Screenshot 2025-06-18 at 18 03 33" src="https://github.com/user-attachments/assets/5122d5b4-5cbe-42d6-89c6-07325e9d11e7" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/28e04c98-36e9-4b2b-b9b1-f71dde163334" />
<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/e5a26da1-87a5-4061-bab3-16159836ef6b" />

## 👤 Profile Details & User Menu

**menu**
At the top right of the app a profile avatar appears (in androidits a generic one, in web its the user customized avatar) when press the menu appears, the menu contains:

  - Profile photo (custom or default avatar)
  - Full name and username
  - see profile details button
  - log out button

### web:
 
<img width="1440" alt="Screenshot 2025-06-18 at 17 49 52" src="https://github.com/user-attachments/assets/f75960ae-b74d-46ab-82d6-5ffb8e29433c" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/7974e234-e787-4940-9748-8eac80cdbd3d" />

**profile details**

when pressing the see profile details button in the profile menu all the user details appears:

- Profile photo (custom or default avatar)
- First name
- last name (if provided)
- username
- gender
- birthday
- phone number

### web:
<img width="1440" alt="Screenshot 2025-06-18 at 17 50 01" src="https://github.com/user-attachments/assets/44ed9901-0b4c-4bc5-91c9-8c96163cd8d1" />

### android:

<img width="295" height="545" alt="image" src="https://github.com/user-attachments/assets/da79fb95-712e-49b3-bd3a-34b9db4a3976" />

Done browsing the app? Let’s explore the [Data Persistence](./Data-Persistence.md) →
