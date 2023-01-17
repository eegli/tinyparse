import { createParser, ValidationError } from '../src';

describe('Docs, cli arguments', () => {
  it('positional arguments', async () => {
    const { parse } = createParser({});
    const parsed = await parse(['hello-world']);
    expect(parsed).toBe({ _: ['hello-world'] });
  });
  it('number conversion', async () => {
    const { parse } = createParser({
      followers: 0, // expect number
      year: '2000', // expect (date) string
    });
    const parsed = await parse(['--followers', '8', '--year', '2023']);
    expect(parsed.followers).toBe(8);
    expect(parsed.year).toBe('2023');
  });
  it('standalone flags 1', async () => {
    const { parse } = createParser({
      verbose: false,
    });
    const parsed = await parse(['--verbose']);
    expect(parsed.verbose).toBe(true);
  });
  it('standalone flags 2', async () => {
    const { parse } = createParser({
      verbose: true,
    });
    const parsed = await parse(['--verbose']);
    expect(parsed.verbose).toBe(true);
  });
});

describe('Docs, short flags', () => {
  it('handles short flags', async () => {
    const { parse } = createParser(
      {
        user: '',
        verbose: false,
      },
      {
        options: {
          user: {
            shortFlag: '-u',
          },
          verbose: {
            shortFlag: 'v',
          },
        },
      }
    );
    const parsed = await parse(['-v', '-u', 'eegli']);
    expect(parsed.verbose).toBe(true);
    expect(parsed.user).toBe('eegli');
  });
});

describe('Docs, error handling', () => {
  it('rejects invalid types', async () => {
    expect.assertions(1);
    const { parse } = createParser({ username: '' });
    try {
      // @ts-expect-error test input
      await parse({ username: ['eegli'] });
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.message).toBe(
          'Invalid type for "username". Expected string, got object'
        );
      }
    }
  });
  it('rejects for missing args', async () => {
    expect.assertions(1);
    const { parse } = createParser(
      { username: '' },
      {
        options: {
          username: {
            required: true,
          },
        },
      }
    );
    try {
      await parse(); // Whoops, forgot username!
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.message).toBe('"username" is required');
      }
    }
  });
});
