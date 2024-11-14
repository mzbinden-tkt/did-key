import { Collection } from 'mongodb';
import { saveKeys } from '../keys';
import { KeyPair } from '../../models/Keys';
import { BadRequestError } from '../../errors';

jest.mock('../client', () => ({
  getDatabase: jest.fn().mockReturnValue({
    collection: jest.fn(),
  }),
}));

describe('Keys Repository', () => {
  let mockCollection: jest.Mocked<Collection>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn(),
      insertOne: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    (require('../client').getDatabase().collection as jest.Mock).mockReturnValue(mockCollection);
  });

  describe('saveKeys', () => {
    const mockKey: KeyPair = {
      publicKey: new Uint8Array([1, 2, 3]),
      privateKey: new Uint8Array([4, 5, 6]),
    };

    it('should save a key successfully', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true } as any);

      await saveKeys(mockKey.publicKey, mockKey.privateKey);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: mockKey.publicKey,
          privateKey: mockKey.privateKey,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw BadRequestError when key is null', async () => {
      await expect(
        saveKeys(null as unknown as Uint8Array, null as unknown as Uint8Array)
      ).rejects.toThrow(
        new BadRequestError('Error saving metadata DID: Public or private key is missing')
      );
    });

    it('should propagate errors during save operation', async () => {
      const mockError = new Error('Insert failed');
      mockCollection.insertOne.mockRejectedValue(mockError);

      await expect(saveKeys(mockKey.publicKey, mockKey.privateKey)).rejects.toThrow(
        'Insert failed'
      );
    });
  });
});
