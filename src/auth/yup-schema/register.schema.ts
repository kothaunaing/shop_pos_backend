import * as yup from 'yup';

export const roles = ['CUSTOMER', 'CASHIER', 'KITCHEN', 'STOCKHOLDER', 'ADMIN'];

export const registerSchema = yup
  .object({
    name: yup
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(30, 'Name must be maximum of 30 characters')
      .required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    //  role: yup.string().oneOf(roles, "Invalid role")
  })
  .noUnknown('Unknown fields are not allowed');
