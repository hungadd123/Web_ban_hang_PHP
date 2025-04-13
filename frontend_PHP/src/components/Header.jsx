import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { TbUserCircle } from "react-icons/tb";
import { LogIn, ShieldCheck, Store, Clock, XCircle } from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
    const navigate = useNavigate();
    const { getCartCount, token, setToken, storeInfo, user, setUser, updateStoreInfoContext } = useContext(ShopContext);
    console.log(storeInfo)
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("storeInfo");
        setToken("");
        setUser(null);
        updateStoreInfoContext(null);
    };

    return (
        <header className="max-padd-container w-full mb-4 md:mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between py-3">

                <Link to="/" className="flex items-center gap-x-2 flex-1 bold-24 xl:bold-28 text-gray-900 dark:text-white">
                    Underdogs
                </Link>


                <div className="flex-1 flex justify-center items-center">
                    <Navbar
                        containerStyles={
                            "hidden xl:flex items-center gap-x-5 xl:gap-x-6 text-sm font-medium bg-black text-white ring-1 ring-gray-800 rounded-lg p-2"
                        }
                    />
                </div>


                <div className="flex-1 flex items-center justify-end gap-x-3 xs:gap-x-4">

                    <Link to="/cart">
                         <Button variant="outline" size="default" className="rounded-full relative px-4 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
                            Cart
                            <span className="ml-1 bg-black text-white text-xs font-bold absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full shadow-md">
                                {getCartCount()}
                            </span>
                        </Button>
                    </Link>


                    {token ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 w-10 h-10 p-0 flex items-center justify-center">
                                    <TbUserCircle className="w-8 h-8 cursor-pointer text-gray-700 dark:text-gray-300" />
                                    <span className="sr-only">Open user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 mr-4" align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer">
                                    Orders
                                </DropdownMenuItem>

                                {user?.role_id === 1 && (
                                    <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400 focus:bg-indigo-100 dark:focus:bg-indigo-900/50">
                                        <ShieldCheck className="mr-2 h-4 w-4"/>
                                        Admin Panel
                                    </DropdownMenuItem>
                                )}

                                {!storeInfo ? (
                                    <DropdownMenuItem onClick={() => navigate("/request-store")} className="cursor-pointer">
                                        <Store className="mr-2 h-4 w-4"/> Open Your Store
                                    </DropdownMenuItem>
                                ) : storeInfo.status === 'approved' ? (
                                    <DropdownMenuItem onClick={() => navigate("/my-store")} className="cursor-pointer">
                                        <Store className="mr-2 h-4 w-4"/> My Store
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem disabled className="opacity-70">
                                        {storeInfo.status === 'pending' ? <Clock className="mr-2 h-4 w-4 text-yellow-500"/> : <XCircle className="mr-2 h-4 w-4 text-red-500"/>}
                                        Store: <span className='ml-1 capitalize'>{storeInfo.status}</span>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-400">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => navigate("/login")} variant="outline" className="rounded-full border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
                            Login
                            <LogIn className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;