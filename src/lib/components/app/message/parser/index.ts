import SimpleMarkdown, { type ParserRule } from '@khanacademy/simple-markdown';
import {
  autolink,
  blockQuote,
  br,
  codeBlock,
  em,
  emoticon,
  heading,
  spoiler,
  strikethrough,
  subtext,
  text,
  url,
  user,
} from './rules';

// rules normal users can use
export const rules: Record<string, ParserRule> = {
  blockQuote,
  codeBlock,
  newline: SimpleMarkdown.defaultRules.newline,
  escape: SimpleMarkdown.defaultRules.escape,
  autolink,
  url,
  em,
  strong: SimpleMarkdown.defaultRules.strong,
  underline: SimpleMarkdown.defaultRules.u,
  strikethrough,
  inlineCode: SimpleMarkdown.defaultRules.inlineCode,
  text,
  emoticon,
  br,
  spoiler,
  heading,
  subtext,
  user,
};

const parser = SimpleMarkdown.parserFor(rules, { inline: true });

export default parser;
