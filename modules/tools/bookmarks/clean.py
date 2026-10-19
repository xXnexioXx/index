import re

INPUT_FILE = "bookmarks.html"
OUTPUT_FILE = "bookmarks_clean.html"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = f.read()

data = re.sub(r'\sICON="[^"]*"', '', data)
data = re.sub(r"\sICON_URI=\"[^\"]*\"", '', data)
data = re.sub(r'\sADD_DATE="\d+"', '', data)
data = re.sub(r'\sLAST_MODIFIED="\d+"', '', data)
data = re.sub(r'data:image\/[^"]*"', '', data)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(data)

print("Done: bookmarks_clean.html")