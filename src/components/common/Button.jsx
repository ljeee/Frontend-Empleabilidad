const Button = ({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-block' : ''} ${className}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}

export default Button
