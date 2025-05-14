import { type ParserRule } from '@khanacademy/simple-markdown';
import { SpoilerRegex } from '../regex';

export const spoiler: ParserRule = {
  order: 0,
  match: (source) => SpoilerRegex.exec(source),
  parse: function (capture, parse, state) {
    return {
      content: parse(capture[1], state),
    };
  },
};
