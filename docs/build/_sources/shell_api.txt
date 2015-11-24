.. http:get:: /clouds/{cloud_id}/machines/{machine_id}/shell?host={host_ip}&command={shell_command}

   Run shell command in machine. Mist will yield an html body with the command's output.

   **Example request**:

   .. sourcecode:: http

      GET /clouds/2tK74h4mXbjjLlkjjO4SHn3/machines/i-50aa7257/shell?host=129.113.146.116&command=uptime
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    <html>
    <body>
    <script type='text/javascript'>parent.appendShell \
    (' 06:29:06 up 1 day, 21:00,  1 user,  load average: 0.00, 0.01, 0.05<br/>'); \
    </script>
    <script type='text/javascript'>parent.completeShell(1);</script>
    </body>
    </html>
