import { ApplicationError } from '@/protocols';

export function PaymentRequired(): ApplicationError {
  return {
    name: 'Payment_Required',
    message: 'Payment required!',
  };
}