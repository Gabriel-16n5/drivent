import { TicketStatus } from '@prisma/client';
import faker from '@faker-js/faker';
import dayjs from 'dayjs';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createHotels, createRooms } from '../factories/hotels-factory';
import { createUser, createTicketTypeRemote, createTicketTypeNoHotel, createTicket, createTicketType, createEnrollmentWithAddress, createTicketTypeNoRemoteHotel } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
//   await cleanDb();
});

beforeEach(async () => {
    await cleanDb();
  });

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it('token inválido', async () => {
      const token = faker.lorem.word();
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('token válido', () => {
      it('should respond with status 204 when there is no enrollments', async () => {
        const user = await createUser();
        const token = await generateValidToken();
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NO_CONTENT);
      });
      it('não tem/ acabou tickets', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it('não há vagas', async () => {
        const user = await createUser();
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        const token = await generateValidToken(user);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it('402 é remoto', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotels();
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('200 volta info', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeNoRemoteHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotels();
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              image: expect.any(String),
            }),
          ]),
        );
      });

    });
  });

  describe('GET /hotels/:hotelId', () => {
    describe('auth erros', () => {
      it('401 sem token', async () => {
        const response = await server.get('/hotels/1');
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
      it('token inválido', async () => {
        const token = faker.lorem.word();
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });

    });
  
    describe('valid token', () => {
      it('should respond with 404 if there is no enrollment', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it('402 é remoto', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotels();
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });
      it('ticket not found', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it('hotel not found', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it('200 volta info', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeNoRemoteHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotels();
        await createRooms(hotel.id);
        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                capacity: expect.any(Number),
                hotelId: expect.any(Number),
              }),
            ]),
          }),
        );
      });
    });
  });