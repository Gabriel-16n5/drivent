import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}


export async function createTicketTypeNoHotel() {
  return prisma.ticketType.create({
    data: {
      price: faker.datatype.number(),
      name: faker.name.findName(),
      includesHotel: false,
      isRemote: false
    },
  });
}


export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      price: faker.datatype.number(),
      name: faker.name.findName(),
      includesHotel: faker.datatype.boolean(),
      isRemote: true
    },
  });
}


export async function createTicketTypeNoRemoteHotel() {
  return prisma.ticketType.create({
    data: {
      price: faker.datatype.number(),
      name: faker.name.findName(),
      includesHotel: true,
      isRemote: false
    },
  });
}