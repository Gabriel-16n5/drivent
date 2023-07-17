import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../middlewares';
import hotelsService from '../services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotels = await hotelsService.getHotels(userId);
    if (!hotels) return res.sendStatus(httpStatus.NOT_FOUND);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === 'Payment_Required') {return res.sendStatus(httpStatus.PAYMENT_REQUIRED)}; 
    if (error.name === 'NotFoundError') {return res.sendStatus(httpStatus.NOT_FOUND)};
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const id = Number(req.params.hotelId);

    const hotelUser = await hotelsService.getHotelById(userId, id);
    if (!hotelUser) {return res.sendStatus(httpStatus.NOT_FOUND)};
    return res.status(httpStatus.OK).send(hotelUser);

  } catch (error) {
    if (error.name === 'NotFoundError') {return res.sendStatus(httpStatus.NOT_FOUND)};
    if (error.name === 'Payment_Required') {return res.sendStatus(httpStatus.PAYMENT_REQUIRED)};
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}