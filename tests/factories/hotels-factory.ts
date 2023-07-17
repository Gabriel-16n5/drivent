import faker from "@faker-js/faker";
import { prisma } from '@/config';


export async function createRooms(hotelId: number){
    return prisma.room.create({
        data: {
            hotelId,
            name: faker.lorem.word(5),
            capacity: 4,
            updatedAt: faker.date.recent()
        }
    })
}

export async function createHotels(){
    return prisma.hotel.create({
        data: {
            image: faker.lorem.words(3),
            name: faker.commerce.department(),
            createdAt: faker.date.recent()
        }
    })
}