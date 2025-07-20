import React from 'react';

function Footer() {
  return (
    <footer className="w-full mt-12 py-6 text-center text-gray-500 text-sm">
      <p>&copy; {new Date().getFullYear()} AuraHub. All Rights Reserved.</p>
    </footer>
  );
}

export default Footer;