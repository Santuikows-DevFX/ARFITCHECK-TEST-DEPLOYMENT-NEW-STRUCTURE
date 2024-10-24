# Home Page News Letter Code

 {/* TO BE CHANGED
          <Box sx={{ padding: 2, textAlign: 'center' }} style={styles.root}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 20, sm: 25, md: 30 }, fontWeight: "bold", textAlign: "center", color: "white" }}>
                  BE NOTIFIED
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log('Form submitted:', values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={8}>
                          <Field name="email">
                            {({ field, meta }) => (
                              <div>
                                <TextField
                                  {...field}
                                  id="email"
                                  label="Email"
                                  variant="filled"
                                  fullWidth
                                  type='email'
                                  InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                  sx={{
                                    '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                                    backgroundColor: '#E0DFDF'
                                  }}
                                  inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                                  error={meta.touched && Boolean(meta.error)}
                                  InputProps={{
                                    endAdornment: meta.touched && meta.error ? (
                                      <InputAdornment position="end">
                                        <IconButton>
                                          <Warning color="error" />
                                        </IconButton>
                                      </InputAdornment>
                                    ) : null
                                  }}
                                />
                                {meta.touched && meta.error && (
                                  <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                                    {meta.error}
                                  </FormHelperText>
                                )}
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                          <FilledButton disabled={isSubmitting} type="submit">SUBSCRIBE</FilledButton>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Grid>
            </Grid>
          </Box> */}