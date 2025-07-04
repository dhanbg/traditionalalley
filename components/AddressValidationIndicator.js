import React from 'react';

const AddressValidationIndicator = ({ 
  isValidating, 
  isAddressValid, 
  serviceAvailable, 
  warnings, 
  validationError, 
  enhancedInfo,
  originalInput 
}) => {
  if (isValidating) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-800">Validating address...</span>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-red-800">Validation Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{validationError}</p>
      </div>
    );
  }

  if (isAddressValid && serviceAvailable) {
    // Determine validation completeness level
    const hasFullAddress = originalInput?.addressLine1;
    const hasPostalCode = originalInput?.postalCode;
    const validationLevel = hasFullAddress ? 'complete' : hasPostalCode ? 'partial' : 'basic';
    
    const levelInfo = {
      complete: {
        icon: '🎯',
        title: 'Full Address Validated',
        description: 'Complete address verified and ready for shipping',
        color: 'green'
      },
      partial: {
        icon: '📍',
        title: 'Location Validated',
        description: 'City and postal code verified. Add street address for complete validation.',
        color: 'blue'
      },
      basic: {
        icon: '🌍',
        title: 'Country & City Validated',
        description: 'DHL Express delivers to this city. Add postal code and street address for best results.',
        color: 'blue'
      }
    };

    const level = levelInfo[validationLevel];
    const isComplete = level.color === 'green';

    return (
      <div className="flex flex-col gap-2">
        <div className={`p-4 border rounded-lg ${isComplete 
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <svg className={`w-4 h-4 ${isComplete ? 'text-green-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className={`text-sm font-medium ${isComplete ? 'text-green-800' : 'text-blue-800'}`}>
              {level.icon} {level.title}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {validationLevel.toUpperCase()}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isComplete ? 'text-green-700' : 'text-blue-700'}`}>
            {level.description}
          </p>

          {/* Validation Details */}
          <div className={`mt-2 p-2 rounded border ${
            isComplete ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              isComplete ? 'text-green-600' : 'text-blue-600'
            }`}>
              Validated Fields:
            </p>
            <div className="text-xs text-gray-700 flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Country: {originalInput?.countryCode}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>City: {originalInput?.cityName}</span>
              </div>
              {hasPostalCode && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Postal Code: {originalInput?.postalCode}</span>
                </div>
              )}
              {hasFullAddress && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Street Address: {originalInput?.addressLine1}</span>
                </div>
              )}
              {!hasPostalCode && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">○</span>
                  <span className="text-gray-500">Postal Code: Not provided</span>
                </div>
              )}
              {!hasFullAddress && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">○</span>
                  <span className="text-gray-500">Street Address: Not provided</span>
                </div>
              )}
            </div>
          </div>
          
          {enhancedInfo?.standardizedAddress && (
            <div className="mt-2 p-2 rounded border bg-green-50 border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Standardized Address:</p>
              <div className="text-xs text-green-700 flex flex-col gap-1">
                {enhancedInfo.standardizedAddress.cityName && (
                  <div>City: {enhancedInfo.standardizedAddress.cityName}</div>
                )}
                {enhancedInfo.standardizedAddress.postalCode && (
                  <div>Postal Code: {enhancedInfo.standardizedAddress.postalCode}</div>
                )}
                {enhancedInfo.standardizedAddress.countyName && (
                  <div>County: {enhancedInfo.standardizedAddress.countyName}</div>
                )}
              </div>
            </div>
          )}

          {enhancedInfo?.serviceArea && (
            <div className="mt-2 p-2 rounded border bg-green-50 border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Service Area:</p>
              <div className="text-xs text-green-700">
                <div>Code: {enhancedInfo.serviceArea.code}</div>
                {enhancedInfo.serviceArea.description && (
                  <div>Description: {enhancedInfo.serviceArea.description}</div>
                )}
                {enhancedInfo.serviceArea.gmtOffset && (
                  <div>GMT Offset: {enhancedInfo.serviceArea.gmtOffset}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {warnings && warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">Warnings</span>
            </div>
            <ul className="mt-1 text-sm text-yellow-700 flex flex-col gap-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{warning.message || warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!serviceAvailable) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-red-800">Service Not Available</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          DHL Express does not deliver to this location. Please check the address or try a different destination.
        </p>
      </div>
    );
  }

  return null;
};

export default AddressValidationIndicator; 