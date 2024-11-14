import { Router } from 'express';
import { createDIDController } from '../controllers/did';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateDIDRequest:
 *       type: object
 *       required:
 *         - method
 *         - keyType
 *       properties:
 *         method:
 *           type: string
 *           enum: [key]
 *         keyType:
 *           type: string
 *           enum: [Ed25519, Secp256k1]
 *         options:
 *           type: object
 *           properties:
 *             publicKeyFormat:
 *               type: string
 *               enum: [JsonWebKey2020, Ed25519VerificationKey2020, Multikey]
 *             enableExperimentalPublicKeyTypes:
 *               type: boolean
 *             defaultContext:
 *               type: array
 *               items:
 *                 type: string
 *             enableEncryptionKeyDerivation:
 *               type: boolean
 *     CreateDIDResponse:
 *       type: object
 *       properties:
 *         document:
 *           type: object
 *           properties:
 *             '@context':
 *               type: array
 *               items:
 *                 type: string
 *             id:
 *               type: string
 *             verificationMethod:
 *               type: array
 *               items:
 *                 type: object
 *             authentication:
 *               type: array
 *               items:
 *                 type: string
 *             assertionMethod:
 *               type: array
 *               items:
 *                 type: string
 *             capabilityDelegation:
 *               type: array
 *               items:
 *                 type: string
 *             capabilityInvocation:
 *               type: array
 *               items:
 *                 type: string
 *             keyAgreement:
 *               type: array
 *               items:
 *                 type: object
 */

const router = Router();

/**
 * @openapi
 * /did:
 *   post:
 *     summary: Create a new DID document
 *     tags: [DID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDIDRequest'
 *     responses:
 *       201:
 *         description: DID document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateDIDResponse'
 *       400:
 *         description: Bad request - Invalid input parameters
 *       500:
 *         description: Internal server error
 */
router.post('/did', createDIDController);

export default router;
