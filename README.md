# BizOps Configurator Overview
## End of Life notice - 2024.09.06
This application will no longer be actively developed, due to new Dynatrace dashboards and AppEngine having greater capabilities. You may continue using the app and bug and security fixes will continue as before; however, no new features will be added.

## What the heck is this thing?
This is a Single Page App (SPA) to get inputs from the user and from the Dynatrace API, to transform a stock collection of currated dashboards, and to upload via the Dynatrace API

## Why?
There's amazing insights that be unlocked just by using stock Dynatrace dashboard tiles. Building dashboards is pretty easy: just drag and drop, populate a few USQL queries, and poof business relevant insights. How can we make it even faster? Share a currated list of dashboards used across our customer base and customize queries with a few clicks and drags. All using the power of the Dynatrace API that's already available.

## Getting started
Click here: [dynatrace.github.io/BizOpsConfigurator](https://dynatrace.github.io/BizOpsConfigurator).

Be sure to check out the Prerequisites and Overview pages.

## Support policy
THIS IS NOT PART OF THE DYNATRACE PRODUCT. This was meant to be a demonstration app, but proved to have some actual utility. It is, however, provided without any representations, warranties, or formal support whatsoever. If you post on our [forum](https://answers.dynatrace.com/spaces/482/dynatrace-open-qa/kbentry/236940/bizops-configurator-comments-and-news.html) we will try to answer questions you may have.

## Privacy
We use Dynatrace to monitor this application. Here's what we're capturing:
-  **Session Replay** - we are masking your tokens, but capturing everything else so we can understand how you're using the tool and why it may have broken.
-  **Your tenant URL** - this allows us to understand where you're putting the dashboards
-  **Username** - We grab your username from the authentication response using your token
-  **Number of BizOps Dashboards deployed** - We want to know how much you're using the tool
-  **Your IP / GeoLocation** - To understand how your ISP / loction affects performance of the tool

**NOTE:** If you are sending a **DO NOT TRACK** cookie, we don't capture any of the above, just anonymous usage. Your use of the tool indicates your consent for this tracking.
