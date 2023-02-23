import fs from 'fs';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

export { mockFs };
