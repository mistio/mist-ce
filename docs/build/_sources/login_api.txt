.. http:post:: mist.io/auth

   Authenticate to mist.io service

   **Example request**:

   .. sourcecode:: http

      POST /auth
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "email":"user376@mail.com",
        "password":"mysuperpassword"
      }

   **Example response**:

   .. sourcecode:: http

    {
       "mist_api_token": "4a2c2j08099809709as098087832843e561abb495c4a30726a8590f73adad",
       "current_plan":
       {
           "started": 1384966750.686227,
           "has_expired": false,
           "promo_code": "PROMO50",
           "expiration": 1416502750.686229,
           "title": "Basic"
       },
       "user_details":
       {
           "country": "Greece",
           "number_of_servers": "1-5",
           "number_of_people": "1-5",
           "name": "John Doe",
           "company_name": "mist"
       }
    }


   Using this api token in your header you can now use all of mist.io's API by passing in your headers::

    Authorization: mist_1 user376@mail.com:4a2c2j08099809709as098087832843e561abb495c4a30726a8590f73adad

   In case you have your own installation of mist, you do not have to authenticate and get
   a token to use mist.io's RESTful API. However by doing so you can have your own setup and
   use the premioum services of mist such as monitoring, adding rules and alerts to your machine.

