import re 
import sys 

with open("diff.txt") as f:
    diff = f.read()

regexp = re.compile(r"^((\+|\-)   )((?!id).)*$",  re.MULTILINE)
found = re.findall(regexp, diff)
if found:
    print(found)
    sys.exit(1)