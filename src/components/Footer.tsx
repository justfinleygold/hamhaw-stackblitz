import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <Link
              to="/about"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              About Us
            </Link>
            <Link
              to="/privacy"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-base text-gray-400">
            &copy; {currentYear} HamHAW Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}