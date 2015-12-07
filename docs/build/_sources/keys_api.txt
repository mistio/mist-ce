.. http:get:: /keys

   List added keys

   **Example request**:

   .. sourcecode:: http

      GET /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    [
       {
           "default_key": true,
           "id": "passwordless",
           "machines":
           [
               [
                   "2tKqwqDWFFWFDWFESgzqc4SHn3",
                   "i-c0ca59c5",
                   1389715866.596957,
                   "ec2-user",
                   "true"
               ]
           ],
           "name": "passwordless"
       },
       {
           "default_key": false,
           "id": "Key2",
           "machines":
           [
           ],
           "name": "Key 2"
       }
    ]

   For each Key a list of associated machines is returned with *cloud_id, machine_id, username_of_machine, if_sudo* in this order

.. http:put:: /keys

   Add Key

   **Example request**:

   .. sourcecode:: http

      PUT /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "id":"MyKey",
        "priv":"-----BEGIN RSA PRIVATE KEY-----OoiknlOnNJNKCAQEAtbBji1OMHW2bS2Va..."
      }

   :jsonparam string id:  *required* Name of new key
   :jsonparam string priv:  *required* Private ssh key

.. http:post:: /keys

   Ask mist to generate a new private key

   **Example request**:

   .. sourcecode:: http

      GET /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

      {
        "priv":"-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCA..."
      }

.. http:delete:: /keys/{key_id}

   Delete key

   **Example request**:

   .. sourcecode:: http

      DELETE /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

.. http:put:: /keys/{key_id}

   Rename key

   **Example request**:

   .. sourcecode:: http

      PUT /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "new_id":"New Key Name"
      }

   :jsonparam string new_id:  *required* New name for key

.. http:post:: /keys/{key_id}

   Set default key

   **Example request**:

   .. sourcecode:: http

      POST /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

.. http:get:: /keys/{key_id}/private

   Get private key

   **Example request**:

   .. sourcecode:: http

      GET /keys/{key_id}/private
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."

.. http:get:: /keys/{key_id}/public

   Get public key

   **Example request**:

   .. sourcecode:: http

      GET /keys/{key_id}/public
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    "ssh-rsa AAAAB3NzaC1yc2EAAAADAQA..."
