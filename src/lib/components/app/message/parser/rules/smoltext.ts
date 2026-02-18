import SimpleMarkdown, { type ParserRule } from '@khanacademy/simple-markdown';
import { SmoltextRegex } from '../regex';

export const smoltext: ParserRule = {
  order: SimpleMarkdown.defaultRules.heading.order - 0.5,
  match: function (source, state) {
    if (state.prevCapture === null || state.prevCapture.slice(-1)[0] === '\n') {
      return SmoltextRegex.exec(source);
    }
    return null;
  },
  parse: function (capture, parse, state) {
    return {
      content: parse(capture[1], state),
    };
  },
};
