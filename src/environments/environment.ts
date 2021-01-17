// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    apiKey: 'AIzaSyAgsd6oe0G8MnI5Dj7iCiKGit5aIacbSAc',
    authDomain: 'saving-goals.firebaseapp.com',
    databaseURL: 'https://saving-goals.firebaseio.com',
    messagingSenderId: '601029165790',
    projectId: 'saving-goals',
    storageBucket: 'saving-goals.appspot.com',
  },
  production: false,
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
