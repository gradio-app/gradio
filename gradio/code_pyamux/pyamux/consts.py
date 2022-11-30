# coding:utf8

protoVersion = 0

typeData = 0

# WindowUpdate is used to change the window of
# a given stream. The length indicates the delta
# update to the window.
typeWindowUpdate = 1

# Ping is sent as a keep-alive or to measure
# the RTT. The StreamID and Length value are echoed
# back in the response.
typePing = 2

# GoAway is sent to terminate a session. The StreamID
# should be 0 and the length is an error code.
typeGoAway = 3


initialStreamWindow = 256 * 1024


flagSYN = 1

# ACK is sent to acknowledge a new stream. May
# be sent with a data payload
flagACK = 2

# FIN is sent to half-close the given stream.
# May be sent with a data payload.
flagFIN = 4

# RST is used to hard close a given stream.
flagRST = 8

# goAwayNormal is sent on a normal termination
goAwayNormal = 0

# goAwayProtoErr sent on a protocol error
goAwayProtoErr = 1

# goAwayInternalErr sent on an internal error
goAwayInternalErr = 2

sizeOfVersion = 1
sizeOfType = 1
sizeOfFlags = 2
sizeOfStreamID = 4
sizeOfLength = 4
headerSize = sizeOfVersion + sizeOfType + sizeOfFlags + sizeOfStreamID + sizeOfLength
