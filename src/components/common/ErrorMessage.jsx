const ErrorMessage = ({ message = 'Ocurrió un error', onRetry }) => {
  if (!message) return null
  return (
    <div className="alert alert-danger">
      <div>{message}</div>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} type="button">
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
