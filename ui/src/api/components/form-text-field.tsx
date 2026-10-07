import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type FormTextFieldProps = {
  name: string;
} & TextFieldProps;

export const FormTextField = ({ name, ...rest }: FormTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          fullWidth
          {...rest}
          {...field}
          value={field.value ?? ''}
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
};
