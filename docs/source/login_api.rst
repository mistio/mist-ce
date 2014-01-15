.. http:post:: mist.io/login

   Authenticate to mist.io service.

   **Example request**:

   .. sourcecode:: http

      GET /login
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "email":"user376@mail.com",
        "password":"mysuperpassword"
      }

   **Example response**:

   :resheader Set-Cookie: beaker.session.id=5becc619aslkj098aoiljas099e4f; Path=/
   This cookie id will have to be used from here on in your headers as:

   :reqheader cookie: 5becc619aslkj098aoiljas099e4f

   In case you have your own installation of mist, you do not have to authenticate and get
   a beaker.session.id to use mist.io's RESTful API.

