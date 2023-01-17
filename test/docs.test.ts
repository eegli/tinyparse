import { createParser } from '../src';

describe('Docs, CLI Arguments', () => {
  it('creates helper text with descriptions', () => {
    const defaultValues = {
      id: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const { help } = createParser(defaultValues, {
      filePathArg: {
        longFlag: '--config',
        description: 'The config file to use',
      },
      options: {
        id: {},
        color: {
          required: true,
          description: 'A color',
        },
        withAuth: {
          description: 'Require authentication for this action',
          shortFlag: '-wa',
        },
        port: {
          description: 'The port to listen on',
          shortFlag: 'p',
          required: true,
        },
      },
    });
  });
});
