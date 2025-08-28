
* Prev update: 2025-08-23(Sat) 08:36 JST / 2025-08-22(Fri) 23:36 UTC by @hohno_at_kuimc

* Prev update: 2025-08-27(Wed) 06:30 JST / 2025-08-26(Tue) 21:30 UTC by @hohno_at_kuimc

* Prev update: 2025-08-28(Thu) 05:18 JST / 2025-08-27(Wed) 20:18 UTC by @hohno_at_kuimc

* Last update: 2025-08-28(Thu) 12:31 JST / 2025-08-28(Thu) 03:31 UTC by @hohno_at_kuimc

(Case 1) Open index.html with the local MQTT broker on your Mac OS

* terminal 0:

    $ mosquitto -c  /opt/homebrew/etc/mosquitto/mosquitto.conf 

    Note: The following lines are required:

		listener 1883

		protocol mqtt

		listener 9001

		protocol websockets

* terminal 1:

    $ python3 -m http.server 8000

* terminal 2:

    $ open http://localhost:8000/mqtt_receiver_p5/index.html

    Note: Type Command + shift + R to force reload HTML and Javascript


(Case 2) Open index.html then it will connect public MQTT/websocket service automatically

* terminal 1

    $ open https://hohno-46466.github.io/p5.js/mqtt_receiver_p5/index.html

    Note: MQTT topic and broker can be find on on the page above.
