# Phone Canvas Sync Information Flow

When a new participant joins a phone canvass:

1. it tells the PhoneCanvassController.
2. PhoneCanvassController tells the PhoneCanvassService
3. PhoneCanvassService tells the
   a. PhoneCanvassGlobalState which stores the data.
   b. TwilioService to send out a sync update.
