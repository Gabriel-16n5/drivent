import hotelsRepository from "../../repositories/hotels-repository";
import { notFoundError } from "../../errors";
import enrollmentRepository from "../../repositories/enrollment-repository";
import { PaymentRequired } from "../../errors/payment-required-error";
import ticketsRepository from "../../repositories/tickets-repository";

async function checkRequirements(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {throw notFoundError()};

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {throw notFoundError()};
  if(ticket.status !== "PAID"){throw PaymentRequired()}
  if(ticket.TicketType.isRemote === true){throw PaymentRequired()}
  if(ticket.TicketType.includesHotel === false){throw PaymentRequired()}

  const hotels = await hotelsRepository.getHotels();
  if (hotels.length === 0) {throw notFoundError()};
  if (hotels.length > 0) return hotels;
};

async function getHotelById(userId: number, hotelId: number) {
  await checkRequirements(userId);
  const hotel = await hotelsRepository.getHotelById(hotelId);
  if (hotel===undefined) {throw notFoundError()};
  return hotel;
};

async function getHotels(userId: number) {
  const result = await checkRequirements(userId);
  return result;
};

const hotelsService = { getHotels, getHotelById };

export default hotelsService;