# Messenger Int'l

## Purpose

This is a Messenger copy project with an additional message translation feature. It was originally developed together with one programming partner, Rajat Basali (check spelling). Later, the project was forked and I continued to add features and bug fixes.

## Demo

The project is currently hosted at:

## Run the App

These are instructions to download and run the application locally.

**Dependencies**

There are 3rd party dependencies:

* MongoDB Atlas (hosted)

* SendGrid API (for sending email)

* Google Translation API


These files need to be copied and modified before a local app can run.

```
/server/sample.db-credentials.json

```

This file needs to be copied and renamed as db-credentials.json

```
/server/sample.env
```

This file needs to be copied and renamed as .env

```
/server/sample.translation-credentials.json
```

This file needs to be copied and renamed as translation-credentials.json

Please refer to the documentation from MongoDB, SendGrid, and Google for instructions on how to create developer accounts for those services.


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


