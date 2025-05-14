import SimpleMarkdown from '@khanacademy/simple-markdown';
import { extend } from '../extend';
import { TextRegex } from '../regex';

export const text = extend(
  {
    match: (source) => TextRegex.exec(source),
  },
  SimpleMarkdown.defaultRules.text,
);
