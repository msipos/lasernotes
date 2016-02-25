# Taken from
# https://github.com/yourcelf/bleach-whitelist/blob/master/bleach_whitelist/bleach_whitelist.py

all_tags = [
    "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio",
    "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button",
    "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content",
    "data", "datalist", "dd", "del", "detals", "dfn", "dialog", "dir", "div", "dl", "dt",
    "element", "em", "embed",
    "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset",
    "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html",
    "i", "iframe", "image", "img", "input", "ins", "isindex",
    "kbd", "keygen",
    "label", "legend", "li", "link", "listing",
    "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "multicol",
    "nav", "nobr", "noembed", "noframes", "noscript",
    "object", "ol", "optgroup", "option", "output",
    "p", "param", "picture", "plaintext", "pre", "progress",
    "q",
    "rp", "rt", "ruby",
    "s", "samp", "script", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong",
    "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead",
    "time", "title", "tr", "track", "tt",
    "u", "ul",
    "var", "video",
    "wbr",
    "xmp",
]

# List tags that, if included in a page, could break markup or open XSS.
generally_xss_unsafe = [
    "applet", "audio",
    "bgsound", "body",
    "canvas",
    "embed",
    "frame", "frameset",
    "head", "html",
    "iframe",
    "link",
    "meta",
    "object",
    "param",
    "source", "script",
    "ruby", "rt",
    "title", "track",
    "video",
    "xmp"
]

attrs = {
    "img": ["src", "alt", "title"],
    "a": ["href", "alt", "title"],
}

# Tags that, if included on the page, will probably not break markup or open
# XSS.  Note that these must be combined with attribute whitelisting, or things
# like <img> and <style> could still be unsafe.
generally_xss_safe = list(set(all_tags) - set(generally_xss_unsafe))
generally_xss_safe.sort()
