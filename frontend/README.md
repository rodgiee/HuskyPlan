## For testing database API
For purposes of testing we are using localhost 80(backend)and localhost(frontend) to interact with one another.


Since these applications are on different ports they are from different origin so access control permissions is set and prevents the frontend from interacting with backend.


To properly resolve this we will need to add HTTP headers to the server 'Access-Control-Allow-Origin: <url>' but we are only interacting with localhost for testing purposes.

## Temporary fix
We will use a chrome extension to automatically apply the access control header
https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en


