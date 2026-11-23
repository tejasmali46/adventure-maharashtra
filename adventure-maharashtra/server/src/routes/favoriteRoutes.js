import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorite
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All favorite routes are authenticated

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:parkId', removeFavorite);
router.get('/check/:parkId', checkIsFavorite);

export default router;