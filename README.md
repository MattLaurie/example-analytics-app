# Example Analytics App

The example app is configured to use custom dimensions and metrics in Google Analytics to provide
  the information required to make decisions.
  
The key understanding for Google Analytics is that there is no way to change data so you have 
  to have a plan early in the process.

Fully recommend reading [The Google Analytics Setup I Use on Every Site I Build](https://philipwalton.com/articles/the-google-analytics-setup-i-use-on-every-site-i-build/) 
  before proceeding further.

## Loading Google Analytics

We are loading Google Analytics directly into the application using the following in `index.html`:

```html
<script>addEventListener('error', window.__e=function f(e){f.q=f.q||[];f.q.push(e)});</script>
<script>window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;</script>
<script async src="https://www.google-analytics.com/analytics.js"></script>
```

This is essentially the same approach as the [default snippet](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
  in that the script is loaded asynchronously and any commands are buffered for when the script has loaded.
   
The extra part is an `error` event listener that will capture and buffer any page errors in a global `window.__e.q` array.  Having
  this script early gives us every chance of capturing errors that happen on page load.

## Initialising Google Analytics on startup

Since we want to send custom data to Google Analytics we need to have the application initialise the environment.

To do this we are using a special `APP_INITIALIZER` provide token to have Angular run initialisation code *just* before the 
  application finishes loading.

`core/core.module.ts`:
```
  ...
  providers: [
    AnalyticsService,
    {
      provide: APP_INITIALIZER,
      useFactory: _initialise,
      deps: [ AnalyticsService ],
      multi: true
    }
  ]
  ...
```

The `useFactory: _initialise` specifies that we want the Angular Dependency Injection to invoke our `_initialise` 
  function.  This function just calls our `AnalyticsService.configure` method to initialise our Google Analytics 
  environment.

*Note*: `APP_INITIALIZER` is currently an experimental feature.  If it does become deprecated 
  another approach would be to directly call our `AnalyticsService.configure` method within the application's 
  root component.

## Custom dimensions

`Custom definitions` > `Custom dimensions`

Name | Scope | Custom Dimension Name
--- | --- | ---
`TRACKING_VERSION` | `Hit` | `dimension1`
`CLIENT_ID` | `Hit` | `dimension2`
`WINDOW_ID` | `Hit` | `dimension3`
`HIT_ID` | `Hit` | `dimension4`
`HIT_TIME` | `Hit` | `dimension5`
`HIT_TYPE` | `Hit` | `dimension6`
`HIT_SOURCE` | `Hit` | `dimension7`
`VISIBILITY_STATE` | `Hit` | `dimension8`

* `TRACKING_VERSION` is a way to segment the analytics data into versions.  This allows us to simplify reporting
  by providing a way to avoid having to support all versions of the data in the report.  This is the critical 
  part of the analytics setup.  If you do nothing else have this value in early.
* `CLIENT_ID` is a copy of the Google Analytics `clientId` property stored so we can access in the reports
* `WINDOW_ID` is a simple UUID generated to allow us to differentiate activity by a single user in multiple browser tabs
* `HIT_ID` is a simple UUID generated to identify a single hit
* `HIT_TIME` is the epoch time in milliseconds of a single hit
* `HIT_TYPE` is the type of hit from the Google Analytics event
* `HIT_SOURCE` is the source of the hit
* `VISIBILITY_STATE` is the value of the browser `document.visibilityState`   

## Custom metrics

`Custom definitions` > `Custom metrics`

These metrics are all predicated on the user agent supporting the [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Window/performance). 

Name | Scope | Formatting Type | Custom Dimension Name
--- | --- | --- | ---
`RESPONSE_END_TIME` | `Hit` | `Integer` | `metric1`
`DOM_LOAD_TIME` | `Hit` | `Integer` | `metric2`
`WINDOW_LOAD_TIME` | `Hit` | `Integer` | `metric3`

* `RESPONSE_END_TIME` is how long it took the server to deliver the response
* `DOM_LOAD_TIME` is how long it took the browser to prepare the DOM for rendering
* `WINDOW_LOAD_TIME` is how long it took the browser to load the initial resources
