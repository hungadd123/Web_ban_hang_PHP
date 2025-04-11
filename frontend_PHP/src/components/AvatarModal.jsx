// src/components/AvatarModal.jsx
import React from "react";

const AvatarModal = ({ avatarPreview, handleAvatarChange, handleSaveAvatar, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
        <h3 className="h3 mb-4">Update Store Avatar</h3>
        <div className="mb-4">
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        </div>
        <input type="file" onChange={handleAvatarChange} className="border p-2 w-full mb-4" />
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="btn-white rounded px-3 py-1">
            Cancel
          </button>
          <button onClick={handleSaveAvatar} className="btn-secondary rounded px-3 py-1">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
