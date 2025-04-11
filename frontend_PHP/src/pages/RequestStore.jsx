import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const RequestStore = () => {
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const { backendUrl, token, currency } = useContext(ShopContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/store/request`,
        {
        
          storeName,
          storeAddress,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setStoreName("");
        setStoreAddress("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="px-2 sm:px-8 mt-14 pb-16">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-y-4 lg:w-[500px] mx-auto bg-white p-6 rounded shadow"
      >
        <h3 className="bold-36 text-center mb-4">Request Store Registration</h3>
        <div>
          <label htmlFor="storeName" className="medium-15">
            Store Name
          </label>
          <input
            id="storeName"
            type="text"
            placeholder="Enter store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1"
          />
        </div>
        <div>
          <label htmlFor="storeAddress" className="medium-15">
            Store Address
          </label>
          <input
            id="storeAddress"
            type="text"
            placeholder="Enter store address"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1"
          />
        </div>
        <button type="submit" className="btn-dark mt-4">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default RequestStore;
