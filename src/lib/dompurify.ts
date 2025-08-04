export interface SanitizeConfig {
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
}

// Basic sanitizer mimicking DOMPurify's API.
// Removes script tags and optionally allows extra tags.
const DOMPurify = {
  sanitize(dirty: string, config: SanitizeConfig = {}): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirty, 'text/html');

    // Transform custom tags before sanitization
    doc.querySelectorAll('custom-tag').forEach(el => {
      const div = doc.createElement('div');
      div.className = 'custom-tag';
      div.innerHTML = el.innerHTML;
      el.replaceWith(div);
    });

    // Remove script tags
    doc.querySelectorAll('script').forEach(el => el.remove());

    const allowedTags = new Set([
      'a',
      'b',
      'br',
      'div',
      'em',
      'i',
      'iframe',
      'img',
      'li',
      'ol',
      'p',
      'span',
      'strong',
      'ul',
      ...(config.ADD_TAGS || [])
    ]);

    Array.from(doc.body.querySelectorAll('*')).forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const text = doc.createTextNode(el.textContent || '');
        el.replaceWith(text);
      }
    });

    return doc.body.innerHTML;
  }
};

export default DOMPurify;
