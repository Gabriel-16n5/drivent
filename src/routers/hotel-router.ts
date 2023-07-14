import { Router } from 'express';
import { authenticateToken } from '../middlewares';
import { getHotelById, getHotels } from '../controllers/hotels-controller';

const hotelRouter = Router();

hotelRouter.get('/', authenticateToken, getHotels)
hotelRouter.get('/:hotelId', authenticateToken, getHotelById);
export { hotelRouter };