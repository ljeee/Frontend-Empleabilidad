const LoadingSpinner = ({ message = 'Cargando...', fullscreen = false }) => {
  return (
    <div className={`spinner-wrap ${fullscreen ? 'spinner-full' : ''}`}>
      <div className="spinner" />
      <p className="spinner-text">{message}</p>
    </div>
  )
}

export default LoadingSpinner
