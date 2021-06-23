#!/bin/bash

function prepend() { while read line; do echo "${1}${line}"; done; }

(ganache-cli -h 0.0.0.0 |prepend "[ganache] ") &
sleep 8 && # Start the backend after ganache has started
(npm --prefix api/ run develop | prepend "[backend] ") &
(npm --prefix build/ run start | prepend "[frontend] ")