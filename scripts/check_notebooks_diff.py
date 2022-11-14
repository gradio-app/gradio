import re 
import sys 

with open("diff.txt") as f:
    diff = f.read()

regexp = re.compile(r"^((\+|\-)   )((?!id).)*$",  re.MULTILINE)
if bool(re.findall(regexp, diff)):
    sys.exit(1)