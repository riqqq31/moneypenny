/* Budget HP — SVG construction shared by the three insight charts. */

const SVGNS = 'http://www.w3.org/2000/svg';

export function svgInto(parent, name, attrs) {
  const node = document.createElementNS(SVGNS, name);
  if (attrs) {
    Object.keys(attrs).forEach((k) => {
      node.setAttribute(k, attrs[k]);
    });
  }
  parent.appendChild(node);
  return node;
}
