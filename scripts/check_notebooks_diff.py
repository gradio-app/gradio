import re 
import sys 

with open("diff.txt") as f:
    diff = f.read()
print(diff[:1000])

regexp = re.compile(r"^((\+|\-)   )((?!id).)*$",  re.MULTILINE)
if bool(re.findall(regexp, diff)):
    sys.exit(1)