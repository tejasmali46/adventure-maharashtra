import express from 'express';
import {
  getDestinations,
  getDestinationBySlug
} from '../controllers/destinationController.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

export default router;