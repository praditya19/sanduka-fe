import React from 'react'

const DeleteModal = ({ onConfirm, onCancel }) => {
    return ( <div className="fixed inset-0 flex justify-center items-center bg-black/40">
      <div className="bg-white p-6 rounded text-center">
        <p>Yakin hapus?</p>
        <button onClick={onCancel}>Batal</button>
        <button onClick={onConfirm}>Hapus</button>
      </div>
    </div> );
}
 
export default DeleteModal;