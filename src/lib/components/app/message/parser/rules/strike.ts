import SimpleMarkdown from '@khanacademy/simple-markdown';
import { extend } from '../extend';
import { StrikeThroughRegex } from '../regex';

export const strikethrough = extend(
  {
    match: SimpleMarkdown.inlineRegex(StrikeThroughRegex),
  },
  SimpleMarkdown.defaultRules.del,
);
