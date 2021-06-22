#!/bin/bash

function prepend() { while read line; do echo "${1}${line}"; done; }

(npm --prefix api/ run develop | prepend "[backend] ") &
(npm --prefix build/ run start | prepend "[frontend] ") &
(ganache-cli -h 0.0.0.0 |prepend "[ganache] ")