const passthrough = () => ({ valid: true, message: '' })

const validators = {
  email: passthrough,
  password: passthrough,
  name: passthrough,
}

export { validators }
