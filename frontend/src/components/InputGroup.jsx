import React from 'react';

const InputGroup = ({ id, label, Icon, ...props }) => (
  <div>
    <label 
      htmlFor={id} 
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        </div>
      )}
      <input
        id={id}
        name={id}
        required
        {...props}
        className={`appearance-none block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-kpi focus:border-primary-kpi sm:text-sm bg-white dark:bg-gray-700 dark:text-white transition duration-200 ${
          Icon ? 'pl-10' : '' 
        }`}
      />
    </div>
  </div>
);

export default InputGroup;