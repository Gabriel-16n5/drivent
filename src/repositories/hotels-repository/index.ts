import { prisma } from '../../config';

async function getHotels() {
    const allHotels = prisma.hotel.findMany();
    console.log(allHotels)
    return allHotels
}

async function getHotelById(hotelId: number) {
    const hotelById = prisma.hotel.findUnique({
        where: {
        id: hotelId,
        },
        include: {
        Rooms: true,
        },
    });
    console.log(hotelById)
    return hotelById
}

const hotelsRepository = { getHotels, getHotelById };

export default hotelsRepository;