# OLD MOBILE NUM SCHEMA

    mobileNum: Yup.string()
    .required('Mobile Number is required')
    .test('is-numeric', 'Mobile Number must be a number', (value) => /^\d+$/.test(value))
    .matches(/^\d{10}$/, 'Mobile Number must be exactly 10 digits and follow Philippine format')