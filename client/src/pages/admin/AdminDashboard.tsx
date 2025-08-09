import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  to: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, to }) => {
  return (
    <Link
      to={to}
      className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
    </Link>
  );
};

const AdminDashboard: React.FC = () => {
  const cards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions.',
      to: '/admin/users',
    },
    {
      title: 'Blog Management',
      description: 'Create, edit, and publish blog posts.',
      to: '/admin/blog',
    },
    {
      title: 'Portfolio Management',
      description: 'Manage portfolio items and projects.',
      to: '/admin/portfolio',
    },
    {
      title: 'Service Management',
      description: 'Administer services offered.',
      to: '/admin/services',
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders.',
      to: '/admin/orders',
    },
    {
      title: 'Payment Management',
      description: 'Track and manage payments.',
      to: '/admin/payments',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <DashboardCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default AdminDashboard;