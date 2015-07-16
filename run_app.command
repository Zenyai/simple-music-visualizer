#!/bin/bash

BASEDIR=$(dirname $0)
cd $BASEDIR
python -m SimpleHTTPServer &
open http://localhost:8000
