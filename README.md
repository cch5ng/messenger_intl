# Messenger Int'l

## Purpose

This is a Messenger copy project with an additional message translation feature. It was originally developed together with one programming partner, Rajat Basali (check spelling). Later, the project was forked and I continued to add features and bug fixes.

## Demo

The project is currently hosted at: https://messenger-intl.herokuapp.com/

These are the features:

* Ability to register and log in to the app.

* Ability to send an email invitation to friends to connect on the app.

* Ability to accept or reject an invitation.

* Ability to start a conversation with connected friends.

* Ability to view conversation message in native language (translated) or the friend's language (original).

## (User) Run the App

These items require setup before you can use the app to chat.

* At least 2 users need to be registered with different language preference (if you want to try language translation).
* One user should send an invitation to the second user to connect as friends.
* The second user should accept the friend invitation.
* Afterward either user can initiate a chat by clicking on their friend's avatar from the Contacts list.

## Known Limitations

**TODO**

## (Developer) Run the App

These are instructions to download and run the application locally.

**Dependencies**

There are 3rd party dependencies:

* MongoDB Atlas (hosted)

* SendGrid API (for sending email)

* Google Translation API

These files need to be copied and updated with credentials (like API keys for 3rd party libraries) before a local app can run. Please refer to the documentation from MongoDB, SendGrid, and Google for instructions on how to create developer accounts for those services.


```
/server/sample.env
```

This file needs to be copied and renamed as .env

------

```
/server/sample.translation-credentials.json
```

This file is a template for the Google API key. During account setup, there is a step where you download a private key file (json). Make a copy of this file, rename it as translation-credentials.json, and place it in the /server directory.


**Install libraries**

Clone this repository.

Install the server libraries.

```
cd server
npm install
```

Install the client libraries.

```
cd ../client
npm install
```

**Startup**

Start the app server

```
cd ../server
npm run dev
```

Start the client dev server

```
cd ../client
npm run start
```

**Deployment**

This app is currently deployed on Heroku. If you want to fork and run that app on Heroku, a number of environment variables need to be set (TODO).
