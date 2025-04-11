// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, ShoppingBag, MessageSquare, Users } from 'lucide-react'; // Icons

const AdminSidebar = () => {
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/stores', label: 'Manage Stores', icon: Store },
    { to: '/admin/products', label: 'Manage Products', icon: ShoppingBag },
    // { to: '/admin/reviews', label: 'Manage Reviews', icon: MessageSquare },
    // { to: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      isActive
        ? 'bg-muted text-primary font-semibold' // Kiểu active
        : 'text-muted-foreground' // Kiểu không active
    }`;

  return (
    <aside className="hidden lg:block w-64 bg-background border-r p-4 sticky top-0 h-screen">
      <nav className="flex flex-col gap-2 text-sm font-medium">
        <h3 className="text-lg font-semibold px-3 py-2 text-primary">Admin Panel</h3>
        <hr className='my-2 border-border'/>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end className={getNavLinkClass}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;