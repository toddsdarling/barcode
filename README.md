barcode
=======

Barcode Lookup

This was a tool that was accessed through our mobile app to retrieve their barcode to display on their device. This barcode could then be scanned to check-in while at Hope Community Church for events, etc. Users entered their first name, last name and date of birth. This information would be verified agaisnt our database (Fellowship One) and their barcode would be displayed.  The barcode was saved locally so the user need only enter their name and DOB once.

This tool utilizes Backbone.js and Foundation for the front-end frameworks. PHP was used on the backend to call Fellowship One's RESTful API in order to verify information and return the barcode.
