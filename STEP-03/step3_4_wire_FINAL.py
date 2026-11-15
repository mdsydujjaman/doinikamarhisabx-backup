import re, pathlib
s = pathlib.Path("src/App.jsx").read_text(encoding="utf-8")
orig = s
if "from './step3-ui.js'" not in s:
    m = re.search(r"(import[^\n]+\n)", s)
    s = s[:m.end()] + "import './step3-ui.js';\n" + s[m.end():]
    print("OK: import বসছে")
else:
    print("SKIP: import আছে")
if re.search(r"return\s*\(\s*<>", s):
    s = re.sub(r"return\s*\(\s*<>", "return (", s)
    s = re.sub(r"</>\s*\)\s*;", ");", s)
    print("OK: <> Fix")
else:
    print("SKIP: <> নাই")
print("import =", s.count("from './step3-ui.js'"))
if s != orig:
    pathlib.Path("src/App.jsx").write_text(s, encoding="utf-8")
    print("SAVED")
else:
    print("NO CHANGE: সব ঠিক আছে")
