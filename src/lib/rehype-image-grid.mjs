/**
 * Rehype plugin: auto-group consecutive markdown images into a collage.
 *
 * Handles both authoring shapes MDX produces:
 *  - images on adjacent lines (no blank line) -> ONE <p> with several <img>s
 *  - images separated by blank lines -> a run of single-image <p>s
 *
 * Any "image paragraph" (a <p> whose meaningful children are all <img>s) is
 * merged with adjacent image paragraphs; if the combined run has >= 2 images
 * it becomes a custom `<image-grid images="[{src, alt}, …]">` element, which
 * MDXComponents maps to the ImageGrid component. A lone single-image
 * paragraph passes through untouched and keeps the MdxImg figure treatment.
 */
export default function rehypeImageGrid() {
  const isWhitespace = (node) =>
    node.type === "text" && node.value.trim() === "";

  // Returns the <img> children of a <p> if images are ALL it contains
  // (ignoring whitespace/newline text nodes and <br>s), else null.
  const imagesOf = (node) => {
    if (node.type !== "element" || node.tagName !== "p") return null;
    const meaningful = (node.children || []).filter(
      (c) => !isWhitespace(c) && !(c.type === "element" && c.tagName === "br"),
    );
    if (meaningful.length === 0) return null;
    const allImages = meaningful.every(
      (c) => c.type === "element" && c.tagName === "img",
    );
    return allImages ? meaningful : null;
  };

  return (tree) => {
    const children = tree.children;
    const out = [];
    let i = 0;

    while (i < children.length) {
      const firstImages = imagesOf(children[i]);
      if (!firstImages) {
        out.push(children[i]);
        i += 1;
        continue;
      }

      // Collect the run of image paragraphs (whitespace between is ignored).
      const run = [...firstImages];
      let lastImageIndex = i;
      let j = i + 1;
      while (j < children.length) {
        if (isWhitespace(children[j])) {
          j += 1;
          continue;
        }
        const imgs = imagesOf(children[j]);
        if (!imgs) break;
        run.push(...imgs);
        lastImageIndex = j;
        j += 1;
      }

      if (run.length >= 2) {
        out.push({
          type: "element",
          tagName: "image-grid",
          properties: {
            images: JSON.stringify(
              run.map((img) => ({
                src: img.properties?.src || "",
                alt: img.properties?.alt || "",
              })),
            ),
          },
          children: [],
        });
        i = lastImageIndex + 1;
      } else {
        out.push(children[i]);
        i += 1;
      }
    }

    tree.children = out;
  };
}
