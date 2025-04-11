// src/components/EditProductModal.jsx
import React from "react";

const EditProductModal = ({ editProductData, setEditProductData, handleSaveProduct, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
        <h3 className="h3 mb-4">Edit Product</h3>
        <div className="flex flex-col gap-y-4">
          <div>
            <label className="medium-15">Name</label>
            <input
              type="text"
              value={editProductData.name}
              onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="medium-15">Price</label>
            <input
              type="number"
              value={editProductData.price}
              onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="medium-15">Description</label>
            <textarea
              value={editProductData.description}
              onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="medium-15">Category</label>
            <input
              type="text"
              value={editProductData.category}
              onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="medium-15">Popular</label>
            <input
              type="checkbox"
              checked={editProductData.popular}
              onChange={(e) => setEditProductData({ ...editProductData, popular: e.target.checked })}
            />
          </div>
          <div>
            <label className="medium-15">Colors (comma separated)</label>
            <input
              type="text"
              value={editProductData.colors}
              onChange={(e) => setEditProductData({ ...editProductData, colors: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="e.g., Red, Blue, Green"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onCancel} className="btn-white rounded px-3 py-1">
            Cancel
          </button>
          <button onClick={handleSaveProduct} className="btn-secondary rounded px-3 py-1">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
