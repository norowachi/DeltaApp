import SimpleMarkdown from '@khanacademy/simple-markdown';
import { extend } from '../extend';

export const url = extend(
  {
    parse: (capture) => {
      return {
        content: [
          {
            type: 'text',
            content: capture[1],
          },
        ],
        target: capture[1],
      };
    },
  },
  SimpleMarkdown.defaultRules.url,
);
