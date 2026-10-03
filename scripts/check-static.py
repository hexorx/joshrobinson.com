"""Check built internal URLs/anchors and publication contracts without a server."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import xml.etree.ElementTree as ET

root = Path('dist')
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.links = []; self.ids = set(); self.post_links = []; self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'post-title' in attrs.get('class', '').split(): self.post_links.append(attrs['href'])
        if 'id' in attrs: self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key): self.links.append(attrs[key])
        if attrs.get('srcset'):
            self.links.extend(part.strip().split()[0] for part in attrs['srcset'].split(','))

pages = {path: Page(path.read_text()) for path in root.rglob('*.html')}
failures = []; count = 0
for path, page in pages.items():
    route = '/' + str(path.relative_to(root)).removesuffix('index.html')
    for link in page.links:
        url = urlsplit(urljoin('https://joshrobinson.com' + route, link))
        if url.netloc != 'joshrobinson.com' or url.scheme not in ('http','https'): continue
        target = root / unquote(url.path).lstrip('/')
        if target.is_dir(): target /= 'index.html'
        count += 1
        if not target.is_file(): failures.append(f'{route}: missing {link}')
        elif url.fragment and target.suffix == '.html':
            target_page = pages.get(target) or Page(target.read_text())
            if unquote(url.fragment) not in target_page.ids: failures.append(f'{route}: missing anchor {link}')
feed = ET.parse(root/'rss.xml').getroot()
items = feed.findall('./channel/item')
post_links = pages[root/'blog/index.html'].post_links
assert {item.findtext('link') for item in items} == {'https://joshrobinson.com' + link for link in post_links}
assert not (root/'blog/draft-example/index.html').exists()
assert 'draft-example' not in (root/'rss.xml').read_text()
sitemap = ''.join(path.read_text() for path in root.glob('sitemap*.xml'))
tag_routes = ['/' + str(path.parent.relative_to(root)) + '/' for path in pages if path.parent.parent == root/'tags']
for route in [*post_links, *tag_routes, '/resume/']:
    assert 'https://joshrobinson.com' + route in sitemap
assert 'draft-example' not in sitemap
print(f'Internal link checker: {count} URLs/anchors checked; {len(failures)} broken.')
print(f'RSS/sitemap: {len(items)} published items; posts, tags, resume included; draft excluded.')
if failures: raise SystemExit('\n'.join(failures))
