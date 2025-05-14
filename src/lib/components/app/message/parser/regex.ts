/**
 * Matches block quotes in two formats:
 * 1. Single line: ">>> text"
 * 2. Multi-line: "> text\n> more text"
 *
 * @example >>> This is a block quote
 */
export const BlockQuoteRegex = /^( *>>> ([\s\S]*))|^( *> [^\n]*(\n *> [^\n]*)*\n?)/;

/**
 * Matches code blocks with optional language specification.
 *
 * @example ```javascript
 * const example = "code";
 * ```
 */
export const CodeBlockRegex = /^```(([a-z0-9_+\-.#]+?)\n+)?\n*([^]+?)\n*```/i;

/**
 * Matches the ¯\_(ツ)_/¯ emoticon.
 */
export const EmoticonRegex = /^(¯\\_\(ツ\)_\/¯)/;

/**
 * Matches spoiler text wrapped in double pipes.
 *
 * @example ||This is a spoiler||
 */
export const SpoilerRegex = /^\|\|([\s\S]+?)\|\|/;

/**
 * Matches strikethrough text wrapped in tildes.
 *
 * @example ~~This text is strikethrough~~
 */
export const StrikeThroughRegex = /^~~([\s\S]+?)~~(?!_)/;

/**
 * Matches plain text content in messages.
 *
 * This regex is designed to capture text up to certain delimiters
 * like punctuation, newlines, or specific patterns.
 */
export const TextRegex = /^[\s\S]+?(?=[^0-9A-Za-z\s]|\n\n|\n|\w+:\S|$)/;

/**
 * Matches Discord timestamp mentions.
 *
 * @example <t:123456> or <t:123456:t> for specific formats
 */
export const TimestampRegex = /^<t:(-?\d+)(?::(R|t|T|d|D|f|F))?>/;

/**
 * Matches markdown headings (H1-H3 level).
 *
 * @example # Heading
 * @example ## Subheading
 * @example ### Subsubheading
 */
export const HeadingRegex = /^(#{1,3}) +([^\n]+?)(\n|$)/;

/**
 * Matches subtext in markdown headings.
 *
 * @example -# Subtext
 */
export const SubtextRegex = /^-# +([^\n]+?)(\n|$)/;
