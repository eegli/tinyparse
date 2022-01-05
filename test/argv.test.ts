import { argvToObj } from '../src/creator';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Argv to object', () => {
  it('parses empty', async () => {
    const c = argvToObj([]);
    expect(c).toStrictEqual({});
  });
  it('bool props', async () => {
    const c = argvToObj(['--boolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
    });
  });
  it('string props', async () => {
    const c = argvToObj([
      '--stringProp',
      'str',
      '--boolProp',
      '--numProp',
      '123',
    ]);
    expect(c).toStrictEqual({
      stringProp: 'str',
      boolProp: true,
      numProp: 123,
    });
  });
});
