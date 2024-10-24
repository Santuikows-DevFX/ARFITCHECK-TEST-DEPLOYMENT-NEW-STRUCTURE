import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, FormHelperText } from '@mui/material';

const StyledTextFields = ({ field, meta, id, label, inputProps, errorText, type, disabled, isEulaChecked, handleCloseEULACheck }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <TextField
        {...field} // Pass Formik's field props which includes onChange, onBlur, value, etc.
        id={id}
        disabled={disabled}
        label={label}
        type={showPassword && type === 'password' ? 'text' : type}
        variant="filled"
        fullWidth
        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' }, ...inputProps }}
        error={meta.touched && Boolean(meta.error)}
        InputProps={type === 'password' && {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePasswordVisibility}
              >
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      {meta.touched && meta.error && (
        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
          {errorText || meta.error}
        </FormHelperText>
      )}
    </>
  );
};

export default StyledTextFields;
