import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../errors';
import { DIDDocumentOptions, createDIDKey, getGeneratorKey } from '../services';

const createDIDSchema = z.object({
  method: z.literal('key'),
  keyType: z.enum(['Ed25519', 'Secp256k1'] as const),
  options: z.custom<DIDDocumentOptions>().optional().default({}),
});

export const createDIDController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createDIDSchema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError('Invalid request body: ' + result.error.message);
    }

    const { keyType, options } = result.data;

    const didDocument = await createDIDKey(keyType, getGeneratorKey({ type: keyType }), options);

    res.status(201).json(didDocument);
  } catch (error: unknown) {
    next(error);
  }
};

// export const getDIDHandler = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {

//         const id = req.params.id

//         if (!validate(id)) {
//             throw new BadRequestError('Invalid ID');
//         }

//         const didDocument = await findDID(id);
//         res.status(200).json(didDocument);
//     } catch (error: unknown) {
//         next(error);
//     }
// };
