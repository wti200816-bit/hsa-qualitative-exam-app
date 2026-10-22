import os, sys

DIST_DIR = r"E:\AI\frontend\dist"
OUT_FILE = r"E:\AI\index.html"
OUT_NAMED_FILE = r"E:\AI\HSA_Master.html"

# Read dist/index.html
with open(os.path.join(DIST_DIR, "index.html"), "r", encoding="utf-8") as f:
    raw_html = f.read()

# Read data/hsa_data.js
data_js_path = os.path.join(DIST_DIR, "data", "hsa_data.js")
with open(data_js_path, "r", encoding="utf-8") as f:
    data_js = f.read().strip()

# Read JS bundle (index-*.js)
assets_dir = os.path.join(DIST_DIR, "assets")
js_files = [f for f in os.listdir(assets_dir) if f.endswith(".js")]
if not js_files:
    raise Exception("No JS bundle found in dist/assets")
js_path = os.path.join(assets_dir, js_files[0])
with open(js_path, "r", encoding="utf-8") as f:
    app_js = f.read().strip()

# Extract head contents from index.html (before the script tags)
# We want everything inside <head> except the bundle script and data script
import re

# Remove any script tags referencing data/hsa_data.js or assets/*.js
head_match = re.search(r'<head>(.*?)</head>', raw_html, re.DOTALL)
if not head_match:
    raise Exception("Could not find <head> in dist/index.html")
head_content = head_match.group(1)

# Clean out old script tags from head
head_content = re.sub(r'<script[^>]*src="[^"]*(?:data/hsa_data\.js[^"]*|assets/[^"]+)"[^>]*></script>', '', head_content)
head_content = re.sub(r'<link[^>]*href="[^"]*assets/[^"]+"[^>]*>', '', head_content)

single_html = f"""<!doctype html>
<html lang="vi">
  <head>
{head_content.strip()}
  </head>
  <body class="text-slate-800 antialiased selection:bg-brand-600 selection:text-white min-h-screen">
    <div id="root"></div>

    <!-- 1. All HSA Data (Passages, Templates, 4.028 Questions) -->
    <script>
{data_js}
    </script>

    <!-- 2. Application Engine & React UI (Classic Script, No type=module, 100% Offline file:/// Compatible) -->
    <script>
{app_js}
    </script>
  </body>
</html>"""

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write(single_html)

with open(OUT_NAMED_FILE, "w", encoding="utf-8") as f:
    f.write(single_html)

size_mb = os.path.getsize(OUT_FILE) / (1024 * 1024)
print(f"File created: {OUT_FILE} ({size_mb:.2f} MB)")
print(f"File created: {OUT_NAMED_FILE} ({size_mb:.2f} MB)")
