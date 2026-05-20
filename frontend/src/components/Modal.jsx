function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="section-title-row">
          <h3>{title}</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;


