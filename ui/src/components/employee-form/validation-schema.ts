import * as yup from 'yup';

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol';

const isStrongPassword = (value: string) =>
  value.length >= 8 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[-#!$@£%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/.test(value);

export const employeeFormSchema = (mode: 'add' | 'edit') =>
  yup.object({
    fullName: yup.string().trim().required().max(100).label('Full name'),
    email: yup.string().trim().email().required().label('Email'),
    password:
      mode === 'add'
        ? yup
            .string()
            .required()
            .test(
              'strong-password',
              PASSWORD_MESSAGE,
              (value) => !value || isStrongPassword(value),
            )
            .label('Password')
        : yup.string().optional().label('Password'),
    jobTitle: yup.string().trim().required().label('Job title'),
    department: yup.string().trim().required().label('Department'),
    hireDate: yup
      .string()
      .required()
      .test('not-in-future', 'Hire date cannot be in the future', (value) => {
        if (!value) {
          return false;
        }
        return new Date(value) <= endOfToday();
      })
      .label('Hire date'),
    baseMonthlySalary: yup
      .number()
      .transform((value, original) => (original === '' ? undefined : value))
      .typeError('Base monthly salary must be a number')
      .integer()
      .min(1)
      .required()
      .label('Base monthly salary'),
    status: yup
      .string()
      .oneOf(['active', 'inactive'])
      .required()
      .label('Status'),
  });

export type EmployeeFormSchema = yup.InferType<
  ReturnType<typeof employeeFormSchema>
>;

export type EmployeeFormValues = {
  fullName: string;
  email: string;
  password: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseMonthlySalary: number;
  status: 'active' | 'inactive';
};
