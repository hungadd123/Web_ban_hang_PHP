import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

// Bỏ prop isMenuOpened và onClick
const Navbar = ({ containerStyles }) => {
  const navLinks = [
    { path: "/", title: "Home" },
    { path: "/collection", title: "Collection" },
    { path: "/blog", title: "Blog" },
    { path: "mailto:uderdogs230402@gmail.com", title: "Contact" },
  ];

  return (
    // containerStyles giờ chỉ chứa các class cho desktop
    <nav className={cn(containerStyles)}>
      {navLinks.map((link) => {
        if (link.path.startsWith("mailto:")) {
          return (
            <a
              key={link.title}
              href={link.path}
              // Chỉ còn style cho desktop
              className={cn(
                "px-3 py-1.5 transition-colors duration-200 ease-in-out hover:bg-background/10 rounded"
              )}
              // Bỏ onClick
            >
              {link.title}
            </a>
          );
        }
        return (
          <NavLink
            key={link.title}
            to={link.path}
            // Chỉ còn style cho desktop và active state desktop
            className={({ isActive }) => cn(
              "px-3 py-1.5 transition-colors duration-200 ease-in-out hover:bg-background/10 rounded",
              isActive ? "bg-background/20 rounded" : "" // Active state cho desktop
            )}
            // Bỏ onClick
          >
            {link.title}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navbar;