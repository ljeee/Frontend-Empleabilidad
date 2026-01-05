const Input = ({ label, type = 'text', error, helper, ...props }) => {
  return (
    <label className="form-control">
      {label && <span className="form-label">{label}</span>}
      <input className={`form-input ${error ? 'has-error' : ''}`} type={type} {...props} />
      {helper && !error && <span className="form-helper">{helper}</span>}
      {error && <span className="form-error">{error}</span>}
    </label>
  )
}

export default Input
