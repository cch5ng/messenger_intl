#!/bin/bash

if [ "$ENABLE_DEBUG" == "true" ]; then
	echo "Starting with debugger on port $DEBUG_PORT"
	exec with_ngrok node --debug=$DEBUG_PORT ./server/bin/www
else
	echo "Starting without debugger"
	exec node ./server/bin/www
fi