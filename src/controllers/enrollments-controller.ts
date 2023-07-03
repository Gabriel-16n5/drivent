import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import enrollmentsService from '@/services/enrollments-service';
import { Cep, CepFormated } from '../protocols';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.BAD_REQUEST).send(error.details);
    }
    if (error.name === 'InvalidDataError') {
      return res.status(httpStatus.BAD_REQUEST).send(error.details);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const {cep} = req.query as Cep

  const validCep = (zip: string) => /^[0-9]{5}[0-9]{3}$/.test(zip);
  if(validCep(cep) === true){
  } else {
    return res.send(httpStatus.NO_CONTENT);
  }
  
  try {
    const address: CepFormated = await enrollmentsService.getAddressFromCEP(cep);
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NO_CONTENT).send(error.details);;
    }
    if(error.name === 'InvalidDataError'){
      return res.send(httpStatus.NO_CONTENT).send(error.details);;
    }
  }
}
