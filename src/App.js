import React, { useState, useEffect, useRef } from 'react';
import { Calculator, BookOpen, Award, BarChart3, ChevronRight, Lock, Unlock, X, Copy, Info, Github, ChevronLeft } from 'lucide-react';

// Module-level variable to hold form data - this prevents focus loss
let updatedFormData = {};
let updatedSgpaValues = {};

// Local storage keys
const STORAGE_KEYS = {
  FORM_DATA: 'rvce_calculator_form_data',
  SGPA_VALUES: 'rvce_calculator_sgpa_values',
  FINAL_CGPA_GRADES: 'rvce_calculator_final_cgpa_grades',
  CURRENT_MODE: 'rvce_calculator_current_mode',
  CURRENT_CYCLE: 'rvce_calculator_current_cycle'
};

// Helper functions for localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = {}) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

// SEE Requirements Popup Component
const SEERequirementsPopup = ({ isOpen, onClose, cieTotal, subjectName }) => {
  const [copiedGrade, setCopiedGrade] = useState('');

  if (!isOpen) return null;

  const calculateSEERequired = (targetGrade) => {
  // Formula: (targetGrade - 1) * 10 = (CIE + SEE) / 2
  // So: SEE = (targetGrade - 1) * 20 - CIE
  const requiredSEE = (targetGrade - 1) * 20 - cieTotal;
  return requiredSEE;
  };

  const gradeRequirements = [
  { grade: 10, letter: 'O' },
  { grade: 9, letter: 'A+' },
  { grade: 8, letter: 'A' },
  { grade: 7, letter: 'B+' },
  { grade: 6, letter: 'B' },
  { grade: 5, letter: 'C' },
  { grade: 4, letter: 'P' }
].map(item => ({
  ...item,
  seeRequired: calculateSEERequired(item.grade)
})).filter(item => item.seeRequired >= 35 && item.seeRequired <= 100);

// Find the highest achievable grade (first one in the filtered list)
const highestAchievableGrade = gradeRequirements.length > 0 ? gradeRequirements[0] : null;

// Calculate grade achievable with SEE = 35
const gradeAt35 = Math.min(10, Math.max(0, Math.floor((cieTotal + 35) / 20) + 1));
const gradeAt35Item = {
  grade: gradeAt35,
  letter: ['F', 'F', 'F', 'F', 'P', 'C', 'B', 'B+', 'A', 'A+', 'O'][gradeAt35] || 'F',
  seeRequired: 35
};

  const copyToClipboard = (grade, seeRequired) => {
  const seeText = seeRequired > 100 ? 'Unachievable' : `${seeRequired.toFixed(1)} marks`;
  let text;
  
  if (typeof grade === 'string' && grade.startsWith('min-')) {
    const actualGrade = grade.replace('min-', '');
    const gradeLetter = ['F', 'F', 'F', 'F', 'P', 'C', 'B', 'B+', 'A', 'A+', 'O'][actualGrade] || 'F';
    text = `${subjectName}: Minimum SEE (35 marks) gives Grade ${actualGrade} (${gradeLetter})`;
  } else {
    const gradeLetter = gradeRequirements.find(g => g.grade === grade)?.letter;
    text = `${subjectName}: Need ${seeText} in SEE for Grade ${grade} (${gradeLetter})`;
  }
  
  navigator.clipboard.writeText(text);
  setCopiedGrade(grade);
  setTimeout(() => setCopiedGrade(''), 2000);
};

  const copyAllRequirements = () => {
  let allText = `SEE Requirements for ${subjectName} (CIE: ${cieTotal}):\n`;
  

  allText += gradeRequirements.map(item => {
      const seeText = item.seeRequired > 100 ? 'Unachievable' : `${item.seeRequired.toFixed(1)} marks`;
      return `Grade ${item.grade} (${item.letter}): ${seeText}`;
    }).join('\n');
  navigator.clipboard.writeText(allText);
  setCopiedGrade('all');
  setTimeout(() => setCopiedGrade(''), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">SEE Requirements</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Subject: <span className="font-semibold">{subjectName}</span></p>
          <p className="text-gray-600">CIE Score: <span className="font-semibold">{cieTotal}</span></p>
        </div>

        <div className="space-y-3 mb-6">
          {gradeRequirements.map((item, index) => (
            <div key={item.grade} className={`flex items-center justify-between p-4 rounded-xl border ${
              index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 text-white rounded-lg flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                {item.grade}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Grade {item.letter}</div>
                    <div className="text-sm text-gray-600">
                        SEE: {item.seeRequired > 100 ? 'Unachievable' : `${item.seeRequired.toFixed(1)} marks`}
                    </div>
                  </div>
              </div>
              
              <button
                onClick={() => copyToClipboard(item.grade, item.seeRequired)}
                className="p-2 hover:bg-white rounded-lg transition-colors group"
                title="Copy requirement"
              >
                <Copy className={`w-4 h-4 ${copiedGrade === item.grade ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {gradeAt35Item.grade}
              </div>
              <div>
                <div className="font-semibold text-gray-900">Grade {gradeAt35Item.letter}</div>
                <div className="text-sm text-gray-600">
                  SEE: 35.0
                </div>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(`min-${gradeAt35Item.grade}`, gradeAt35Item.seeRequired)}
              className="p-2 hover:bg-white rounded-lg transition-colors group"
              title="Copy requirement"
            >
              <Copy className={`w-4 h-4 ${copiedGrade === `min-${gradeAt35Item.grade}` ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            </button>
          </div>
        </div>

        <button
          onClick={copyAllRequirements}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            copiedGrade === 'all' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copiedGrade === 'all' ? 'Copied!' : 'Copy All Requirements'}
        </button>
      </div>
    </div>
  );
};

// CGPA Results Popup Component
const CGPAResultsPopup = ({ isOpen, onClose, cgpa }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
  const text = `Final CGPA: ${cgpa}/10`;
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">CGPA Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-gray-900 mb-2">{cgpa}</div>
          <div className="text-gray-600 text-lg">Final CGPA out of 10</div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            copied 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

// SGPA Results Popup Component
const SGPAResultsPopup = ({ isOpen, onClose, sgpa, cycleName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    const text = `${cycleName} SGPA: ${sgpa}/10`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">SGPA Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-gray-700 mb-2">{cycleName}</div>
          <div className="text-5xl font-bold text-gray-900 mb-2">{sgpa}</div>
          <div className="text-gray-600 text-lg">SGPA out of 10</div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            copied 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

// Move SubjectForm outside of the main component to prevent re-creation on each render
const SubjectForm = ({ subject, formData, currentMode, onCalculate, subjectGrades, getGradeLetter, onShowSEERequirements }) => {
  const data = formData[subject.id] || {};
  const result = subjectGrades[subject.id];
  const [validationMessage, setValidationMessage] = useState({ show: false, field: '', message: '' });
  const [inputValues, setInputValues] = useState(() => {
    // Initialize with existing data from localStorage or props
    const existingData = updatedFormData[subject.id] || data;
    return {
      q1: existingData.q1 || '',
      q2: existingData.q2 || '',
      t1: existingData.t1 || '',
      t2: existingData.t2 || '',
      matlab: existingData.matlab || '',
      el: existingData.el || '',
      lab: existingData.lab || '',
      see: existingData.see || ''
    };
  });

  // Refs for keyboard navigation (one for each possible field)
  const refs = {
    q1: useRef(),
    q2: useRef(),
    t1: useRef(),
    t2: useRef(),
    matlab: useRef(),
    el: useRef(),
    lab: useRef(),
    see: useRef()
  };
  // Order for navigation
  let navOrder = ['q1', 'q2', 't1', 't2'];
  if (subject.type === 'math') navOrder.push('matlab', 'el');
  if (subject.type === 'lab') navOrder.push('lab', 'el');
  if (subject.type === 'regular') navOrder.push('el');
  if (currentMode === 'final-grade') navOrder.push('see');
  // Remove duplicates
  navOrder = navOrder.filter((v, i, arr) => arr.indexOf(v) === i);

  // Keyboard navigation handler
  const handleKeyDown = (e, field) => {
    const idx = navOrder.indexOf(field);
    const colCount = 2;
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % navOrder.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + navOrder.length) % navOrder.length;
      if (e.key === 'ArrowDown') nextIdx = (idx + colCount) < navOrder.length ? idx + colCount : idx;
      if (e.key === 'ArrowUp') nextIdx = (idx - colCount) >= 0 ? idx - colCount : idx;
      if (nextIdx !== idx && refs[navOrder[nextIdx]] && refs[navOrder[nextIdx]].current) {
        refs[navOrder[nextIdx]].current.focus();
      }
    }
  };

  const handleInputChange = (field, value) => {
    // Validate input - only allow numbers, decimal points, and empty string
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    
    // Allow empty string or valid numeric input
    if (value === '' || numericRegex.test(value)) {
      // Check maximum value limits
      const numValue = parseFloat(value) || 0;
      let maxValue = 0;
      let isValidRange = true;
      
      // Define maximum values for each field
      switch (field) {
        case 'q1':
        case 'q2':
          maxValue = 10; // Quiz max: 10 marks
          break;
        case 't1':
        case 't2':
          maxValue = 50; // Test max: 50 marks
          break;
        case 'matlab':
          maxValue = 20; // MATLAB max: 20 marks
          break;
        case 'lab':
          maxValue = 30; // Lab max: 30 marks
          break;
        case 'el':
          // EL max depends on subject type
          if (subject.type === 'math') {
            maxValue = 20; // Math subjects: 20 marks
          } else if (subject.type === 'lab') {
            maxValue = 30; // Lab subjects: 30 marks
          } else {
            maxValue = 40; // Regular subjects: 40 marks
          }
          break;
        case 'see':
          maxValue = 100; // SEE max: 100 marks
          break;
        default:
          maxValue = 100; // Default max
      }
      
      // Check if value exceeds maximum
      if (numValue > maxValue) {
        isValidRange = false;
        setValidationMessage({ 
          show: true, 
          field: field, 
          message: `Maximum value allowed is ${maxValue}` 
        });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setValidationMessage(prev => {
            if (prev.field === field) {
              return { show: false, field: '', message: '' };
            }
            return prev;
          });
        }, 3000);
      }
      
      // Only update if value is within range
      if (isValidRange) {
        // Update both local state and module-level variable
        setInputValues(prev => ({ ...prev, [field]: value }));
        
    if (!updatedFormData[subject.id]) {
      updatedFormData[subject.id] = {};
    }
    updatedFormData[subject.id][field] = value;
        
        // Save to localStorage
        saveToStorage(STORAGE_KEYS.FORM_DATA, updatedFormData);
        
        // Hide validation message if it was showing for this field
        if (validationMessage.show && validationMessage.field === field) {
          setValidationMessage({ show: false, field: '', message: '' });
        }
      }
    } else {
      // Show validation message for invalid input
      setValidationMessage({ 
        show: true, 
        field: field, 
        message: 'Enter numeric Values Only' 
      });
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setValidationMessage(prev => {
          if (prev.field === field) {
            return { show: false, field: '', message: '' };
          }
          return prev;
        });
      }, 3000);
    }
  };

  const hasCIEResult = result && result.type === 'cie';

  // Update input values when localStorage data changes
  useEffect(() => {
    const existingData = updatedFormData[subject.id] || data;
    setInputValues({
      q1: existingData.q1 || '',
      q2: existingData.q2 || '',
      t1: existingData.t1 || '',
      t2: existingData.t2 || '',
      matlab: existingData.matlab || '',
      el: existingData.el || '',
      lab: existingData.lab || '',
      see: existingData.see || ''
    });
  }, [updatedFormData, subject.id, data]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          {subject.name}
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {subject.Credit} Credit
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz 1 (Max: 10)</label>
          <input
            type="text"
            value={inputValues.q1}
            onChange={(e) => handleInputChange('q1', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder=""
            ref={refs.q1}
            onKeyDown={(e) => handleKeyDown(e, 'q1')}
          />
          {validationMessage.show && validationMessage.field === 'q1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz 2 (Max: 10)</label>
          <input
            type="text"
            value={inputValues.q2}
            onChange={(e) => handleInputChange('q2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder=""
            ref={refs.q2}
            onKeyDown={(e) => handleKeyDown(e, 'q2')}
          />
          {validationMessage.show && validationMessage.field === 'q2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test 1 (Max: 50)</label>
          <input
            type="text"
            value={inputValues.t1}
            onChange={(e) => handleInputChange('t1', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder=""
            ref={refs.t1}
            onKeyDown={(e) => handleKeyDown(e, 't1')}
          />
          {validationMessage.show && validationMessage.field === 't1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test 2 (Max: 50)</label>
          <input
            type="text"
            value={inputValues.t2}
            onChange={(e) => handleInputChange('t2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder=""
            ref={refs.t2}
            onKeyDown={(e) => handleKeyDown(e, 't2')}
          />
          {validationMessage.show && validationMessage.field === 't2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      </div>
      {/* Subject-specific fields */}
      {subject.type === 'math' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">MATLAB (Max: 20)</label>
            <input
              type="text"
              value={inputValues.matlab}
              onChange={(e) => handleInputChange('matlab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
              placeholder=""
              ref={refs.matlab}
              onKeyDown={(e) => handleKeyDown(e, 'matlab')}
            />
            {validationMessage.show && validationMessage.field === 'matlab' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 20)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
              placeholder=""
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {subject.type === 'lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Internals (Max: 30)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
              placeholder=""
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 30)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
              placeholder=""
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {subject.type === 'regular' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 40)</label>
          <input
            type="text"
            value={inputValues.el}
            onChange={(e) => handleInputChange('el', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder=""
            ref={refs.el}
            onKeyDown={(e) => handleKeyDown(e, 'el')}
          />
          {validationMessage.show && validationMessage.field === 'el' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}
      {currentMode === 'final-grade' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">SEE Marks (Max: 100)</label>
          <input
            type="text"
            value={inputValues.see}
            onChange={(e) => handleInputChange('see', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
            placeholder="0"
            ref={refs.see}
            onKeyDown={(e) => handleKeyDown(e, 'see')}
          />
          {validationMessage.show && validationMessage.field === 'see' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}
      <div className="space-y-4">
        <button
          onClick={() => onCalculate(subject)}
          className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-900 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Calculate {currentMode === 'cie-final' ? 'CIE' : 'Grade'}
        </button>

        {currentMode === 'cie-final' && (
          <button
            onClick={() => onShowSEERequirements(subject, result?.cieTotal)}
            disabled={!hasCIEResult}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              hasCIEResult
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            {hasCIEResult ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            SEE Marks Required
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          {currentMode === 'cie-final' ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                  CIE: {result.cieTotal}
                </div>
              <div className="text-gray-600">out of 100</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
              </div>
              <div className="text-gray-600">
                CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CGPACalculator = () => {
  const [currentMode, setCurrentMode] = useState('');
  const [currentCycle, setCurrentCycle] = useState('');
  const [subjectGrades, setSubjectGrades] = useState({});
  const [formData, setFormData] = useState({});
  const [seePopup, setSeePopup] = useState({ isOpen: false, subject: null, cieTotal: 0 });
  const [finalCGPAGrades, setFinalCGPAGrades] = useState({
  physics: {},
  chemistry: {}
  });
  const [sgpaToggle, setSgpaToggle] = useState({
    physics: false,
    chemistry: false
  });
  /*const [sgpaValues, setSgpaValues] = useState({
    physics: '',
    chemistry: ''
  });*/
  const [cgpaPopup, setCgpaPopup] = useState({ isOpen: false, cgpa: 0 });
  const [sgpaPopup, setSgpaPopup] = useState({ isOpen: false, sgpa: 0, cycleName: '' });
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);
  const [showBugOptions, setShowBugOptions] = useState(false);
  const [sgpaValidationMessage, setSgpaValidationMessage] = useState({ show: false, cycle: '', message: '' });
  const [sgpaInputValues, setSgpaInputValues] = useState({ physics: '', chemistry: '' });

  const subjectCredit = {
    'math': 4, 'math-c': 4, 'phy': 4, 'chem': 4,
    'esc-p': 3, 'esc-c': 3, 'etc': 3, 'core': 3, 'plc': 3
  };

  const modes = [
  {
    id: 'cie-final',
    title: 'CIE Finalization & SEE Marks Required',
    description: 'Calculate your Continuous Internal Evaluation final marks',
    icon: <Calculator className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'final-grade',
    title: 'Final Grade Calculator',
    description: 'Complete grade calculation with predicted SEE marks',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'final-cgpa',
    title: 'Final GPA Calculator',
    description: 'Calculate GPA across both Physics and Chemistry cycles',
    icon: <Award className="w-6 h-6" />,
    color: 'from-green-500 to-green-600'
  }
];

  const cycles = [
    { id: 'physics', name: 'Physics Cycle', emoji: '⚡' },
    { id: 'chemistry', name: 'Chemistry Cycle', emoji: '🧪' }
  ];

  const physicsSubjects = [
    { id: 'math', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'phy', name: 'Physics', Credit: 4, type: 'lab' },
    { id: 'esc-p', name: 'ESC', Credit: 3, type: 'regular' },
    { id: 'etc', name: 'ETC', Credit: 3, type: 'regular' },
    { id: 'core', name: 'Core', Credit: 3, type: 'regular' }
  ];

  const chemistrySubjects = [
    { id: 'math-c', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'chem', name: 'Chemistry', Credit: 4, type: 'lab' },
    { id: 'esc-c', name: 'ESC', Credit: 3, type: 'regular' },
    { id: 'plc', name: 'PLC', Credit: 3, type: 'lab' }
  ];

  const physicsSubjectsCGPA = [
  { id: 'math', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'phy', name: 'Physics', Credit: 4, type: 'lab' },
  { id: 'esc-p', name: 'ESC', Credit: 3, type: 'regular' },
  { id: 'etc', name: 'ETC', Credit: 3, type: 'regular' },
  { id: 'core', name: 'Core', Credit: 3, type: 'regular' },
  { id: 'idea-lab', name: 'IDEA Lab', Credit: 1, type: 'regular' },
  { id: 'comm-eng-p', name: 'Communicative English', Credit: 1, type: 'regular' },
  { id: 'kannada', name: 'Kannada', Credit: 1, type: 'regular' }
];

const chemistrySubjectsCGPA = [
  { id: 'math-c', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'chem', name: 'Chemistry', Credit: 4, type: 'lab' },
  { id: 'esc-c', name: 'ESC', Credit: 3, type: 'regular' },
  { id: 'plc', name: 'PLC', Credit: 3, type: 'lab' },
  { id: 'caeg', name: 'Computer Aided Engineering Graphics', Credit: 3, type: 'regular' },
  { id: 'comm-eng-c', name: 'Communicative English', Credit: 1, type: 'regular' },
  { id: 'constitution', name: 'Fundamentals of Indian Constitution', Credit: 1, type: 'regular' },
  { id: 'yoga', name: 'Yoga', Credit: 1, type: 'regular' }
];

  const getSubjects = () => {
    return currentCycle === 'physics' ? physicsSubjects : chemistrySubjects;
  };

  const calculateCIE = (subject, data) => {
    const { q1 = 0, q2 = 0, t1 = 0, t2 = 0, matlab = 0, el = 0, lab = 0 } = data;
    
    let cieValue;
    if (subject.type === 'math') {
      cieValue = (q1 + q2) + ((t1 + t2) / 100 * 40) + matlab + el;
    } else if (subject.type === 'lab') {
      cieValue = ((q1 + q2) / 2) + ((t1 + t2) / 100 * 30) + lab + el;
    } else {
      cieValue = (q1 + q2) + ((t1 + t2) / 100 * 40) + el;
    }
    
    // Round up to the nearest integer
    return Math.ceil(cieValue);
  };

  const calculateFinalGrade = (cieTotal, see = 0) => {
    // Check for F grade conditions first
    if (cieTotal < 40 || see < 35) {
      return 0; // F grade
    }
    
    const total = (cieTotal + see) / 2;
    return Math.min(10, Math.max(0, Math.floor(total / 10) + 1));
  };

  const getGradeLetter = (grade) => {
    const gradeMap = {
      10: 'O', 9: 'A+', 8: 'A', 7: 'B+', 6: 'B', 5: 'C', 4: 'P', 0: 'F'
    };
    return gradeMap[grade] || 'F';
  };

  const calculateSubject = (subject) => {
    // Update state with current module-level data before calculation
    setFormData(prev => ({ ...prev, ...updatedFormData }));
    
    const data = updatedFormData[subject.id] || {};
    // Convert string values to numbers for calculation
    const numericData = {};
    Object.keys(data).forEach(key => {
      numericData[key] = parseFloat(data[key]) || 0;
    });
    
    const cieTotal = calculateCIE(subject, numericData);
    
    if (currentMode === 'cie-final') {
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, type: 'cie' }
      }));
    } else {
      const see = numericData.see || 0;
      const gradePoint = calculateFinalGrade(cieTotal, see);
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, gradePoint, see, type: 'final' }
      }));
    }
  };

  const showSEERequirements = (subject, cieTotal) => {
    if (cieTotal !== undefined) {
      setSeePopup({
        isOpen: true,
        subject: subject,
        cieTotal: cieTotal
      });
    }
  };

  const closeSEEPopup = () => {
    setSeePopup({ isOpen: false, subject: null, cieTotal: 0 });
  };

  const calculateOverallCGPA = () => {
    const subjects = getSubjects();
    let totalGradePoints = 0;
    let totalCredit = 0;
    
    subjects.forEach(subject => {
      const grade = subjectGrades[subject.id];
      if (grade && grade.gradePoint) {
        totalGradePoints += grade.gradePoint * subject.Credit;
        totalCredit += subject.Credit;
      }
    });
    
    return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : 0;
  };

const gradeOptions = [
  { value: 10, label:'O  (10)' },
  { value: 9, label: 'A+ (9)' },
  { value: 8, label: 'A  (8)' },
  { value: 7, label: 'B+ (7)' },
  { value: 6, label: 'B  (6)' },
  { value: 5, label: 'C  (5)' },
  { value: 4, label: 'P  (4)' },
  { value: 0, label: 'F  (0)' }
];

const calculateFinalCGPA = () => {
  let totalGradePoints = 0;
  let totalCredit = 0;
  
  // Calculate for Physics cycle
  // Calculate for Physics cycle
  if (sgpaToggle.physics && updatedSgpaValues.physics) {
    totalGradePoints += parseFloat(updatedSgpaValues.physics) * 20; // 20 credits for physics cycle
    totalCredit += 20;
  } else {
    physicsSubjectsCGPA.forEach(subject => {
      const grade = finalCGPAGrades.physics[subject.id];
      if (grade !== undefined && grade !== '') {
        totalGradePoints += grade * subject.Credit;
        totalCredit += subject.Credit;
      }
    });
  }
  
  // Calculate for Chemistry cycle
  // Calculate for Chemistry cycle
  if (sgpaToggle.chemistry && updatedSgpaValues.chemistry) {
    totalGradePoints += parseFloat(updatedSgpaValues.chemistry) * 20; // 20 credits for chemistry cycle
    totalCredit += 20;
  } else {
    chemistrySubjectsCGPA.forEach(subject => {
      const grade = finalCGPAGrades.chemistry[subject.id];
      if (grade !== undefined && grade !== '') {
        totalGradePoints += grade * subject.Credit;
        totalCredit += subject.Credit;
      }
    });
  }
  
  return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : '0.00';
};

const handleFinalCGPACompute = () => {
  const cgpa = calculateFinalCGPA();
  setCgpaPopup({ isOpen: true, cgpa });
};

const closeCGPAPopup = () => {
  setCgpaPopup({ isOpen: false, cgpa: 0 });
};

const handleSGPACompute = (cycle) => {
  const sgpa = calculateCycleSGPA(cycle);
  const cycleName = cycle === 'physics' ? 'Physics Cycle' : 'Chemistry Cycle';
  setSgpaPopup({ isOpen: true, sgpa, cycleName });
};

const closeSGPAPopup = () => {
  setSgpaPopup({ isOpen: false, sgpa: 0, cycleName: '' });
};

const handleSgpaToggle = (cycle) => {
  setSgpaToggle(prev => ({
    ...prev,
    [cycle]: !prev[cycle]
  }));
  
  // Reset grades for this cycle when toggle is turned on
  if (!sgpaToggle[cycle]) {
    setFinalCGPAGrades(prev => ({
      ...prev,
      [cycle]: {}
    }));
  }
  
  // Reset SGPA value when toggle is turned off
  if (sgpaToggle[cycle]) {
    updatedSgpaValues[cycle] = '';
  }
};

const handleSgpaValueChange = (cycle, value) => {
  // Simple assignment like in original
  updatedSgpaValues[cycle] = value;
  
  // Update state for controlled component
  setSgpaInputValues(prev => ({ ...prev, [cycle]: value }));
  
  // Save to localStorage (your new feature)
  saveToStorage(STORAGE_KEYS.SGPA_VALUES, updatedSgpaValues);
};

const calculateCycleSGPA = (cycle) => {
  const subjects = cycle === 'physics' ? physicsSubjectsCGPA : chemistrySubjectsCGPA;
  let totalGradePoints = 0;
  let totalCredit = 0;
  
  subjects.forEach(subject => {
    const grade = finalCGPAGrades[cycle][subject.id];
    if (grade !== undefined && grade !== '') {
      totalGradePoints += grade * subject.Credit;
      totalCredit += subject.Credit;
    }
  });
  
  return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : '0.00';
};

  // Initialize updatedFormData when component mounts or changes cycles
  // Initialize updatedFormData when component mounts or changes cycles
  useEffect(() => {
    updatedFormData = loadFromStorage(STORAGE_KEYS.FORM_DATA, {});
    updatedSgpaValues = loadFromStorage(STORAGE_KEYS.SGPA_VALUES, { physics: '', chemistry: '' });
    setCurrentMode(loadFromStorage(STORAGE_KEYS.CURRENT_MODE, ''));
    setCurrentCycle(loadFromStorage(STORAGE_KEYS.CURRENT_CYCLE, ''));
    setFinalCGPAGrades(loadFromStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, { physics: {}, chemistry: {} }));
    setSgpaInputValues(loadFromStorage(STORAGE_KEYS.SGPA_VALUES, { physics: '', chemistry: '' }));
    setFormData(loadFromStorage(STORAGE_KEYS.FORM_DATA, {}));
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORM_DATA, updatedFormData);
    saveToStorage(STORAGE_KEYS.SGPA_VALUES, updatedSgpaValues);
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, currentMode);
    saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, currentCycle);
    saveToStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, finalCGPAGrades);
  }, [currentMode, currentCycle, updatedFormData, updatedSgpaValues, finalCGPAGrades]);

  // Reset Marks function
  const handleResetMarks = () => {
    // Clear all localStorage
    clearAllStorage();
    
    // Reset all state
    setCurrentMode('');
    setCurrentCycle('');
    setSubjectGrades({});
    setFormData({});
    setFinalCGPAGrades({ physics: {}, chemistry: {} });
    setSgpaToggle({ physics: false, chemistry: false });
    setSgpaInputValues({ physics: '', chemistry: '' });
    setSgpaValidationMessage({ show: false, cycle: '', message: '' });
    
    // Reset module-level variables
    updatedFormData = {};
    updatedSgpaValues = { physics: '', chemistry: '' };

  };

  const handleResetCIEFinalisationMarks = () => {
    saveToStorage(STORAGE_KEYS.FORM_DATA, {});
    setFormData({});
    setSubjectGrades({});
    updatedFormData = {};
  };

  const handleResetFinalGPACalcMarks = () => {
    saveToStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, { physics: {}, chemistry: {} });
    saveToStorage(STORAGE_KEYS.SGPA_VALUES, { physics: '', chemistry: '' });
    setFinalCGPAGrades({ physics: {}, chemistry: {} });
    setSgpaToggle({ physics: false, chemistry: false });
    setSgpaInputValues({ physics: '', chemistry: '' });
    updatedSgpaValues = { physics: '', chemistry: '' };
  };

  const handleSetCurrentMode = (mode) => {
    setCurrentMode(mode);
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, mode);
  };

  const handleSetCurrentCycle = (cycle) => {
    setCurrentCycle(cycle);
    saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, cycle);
  };

  const ModeSelection = () => (
  <div className="space-y-8">
    <div className="text-center mb-12 max-w-3xl mx-auto space-y-6">
      {/* Header Bubble */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Academic Calculator</h1>
        <p className="text-xl text-gray-600">Choose your calculation mode</p>
      </div>
      
      {/* RVCE Logo Button Bubble */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <a 
          href="https://rvce.edu.in/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-150 rounded-2xl px-12 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
        >
          <img 
            src="https://www.rvinstitutions.com/wp-content/uploads/2017/09/Logo-1-white-1024x1024-1.png" 
            alt="RVCE Logo" 
            className="w-20 h-20 object-contain filter invert"
          />
        </a>
      </div>
    </div>
             
    <div className="grid gap-6 max-w-3xl mx-auto">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => handleSetCurrentMode(mode.id)}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center text-white shadow-lg`}>
                {mode.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{mode.title}</h3>
                <p className="text-gray-600">{mode.description}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>
      ))}
    </div>
  </div>
);
  

  const CycleSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentMode('')}
          className="flex items-center group"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors font-medium">Back</span>
        </button>
        <div className="w-32"></div>
      </div>
      
      <div className="grid gap-6 max-w-lg mx-auto">
        {cycles.map((cycle) => (
          <button
            key={cycle.id}
            onClick={() => handleSetCurrentCycle(cycle.id)}
            className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-center group transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">{cycle.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {cycle.name}
            </h3>
          </button>
        ))}
      </div>

    </div>
  );

  const FinalCGPAView = () => {
    const handleGradeChange = (cycle, subjectId, grade) => {
      setFinalCGPAGrades(prev => ({
        ...prev,
        [cycle]: {
          ...prev[cycle],
          [subjectId]: grade === '' ? undefined : parseInt(grade)
        }
      }));
    };

    const renderSubjectCard = (subject, cycle) => (
      <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex-1">
          <span className="font-medium text-gray-900 block">{subject.name}</span>
          <span className="text-sm text-gray-600">{subject.Credit} Credit</span>
        </div>
        <select
          value={finalCGPAGrades[cycle][subject.id] || ''}
          onChange={(e) => handleGradeChange(cycle, subject.id, e.target.value)}
          disabled={sgpaToggle[cycle]}
          className={`ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            sgpaToggle[cycle] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
          }`}
        >
          <option value="">Select Grade</option>
          {gradeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentMode('')}
          className="flex items-center group"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors font-medium">Back</span>
        </button>
        <div className="w-32"></div>
      </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Physics Cycle */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                ⚡ Physics Cycle
              </h3>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                20 Credit
              </span>
            </div>
            <div className="space-y-3">
              {physicsSubjectsCGPA.map((subject) => renderSubjectCard(subject, 'physics'))}
            </div>
            {/* Compute SGPA Button */}
            <button
              onClick={() => handleSGPACompute('physics')}
              disabled={sgpaToggle.physics}
              className={`w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all ${
                sgpaToggle.physics 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              Compute SGPA
            </button>
            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            {/* SGPA Input Section */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-900 font-medium">Enter SGPA for Physics Cycle</span>
                <button
                  onClick={() => handleSgpaToggle('physics')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    sgpaToggle.physics ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sgpaToggle.physics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {sgpaToggle.physics && (
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  defaultValue={updatedSgpaValues.physics || ''}
                  onChange={(e) => handleSgpaValueChange('physics', e.target.value)}
                  placeholder="Enter SGPA :"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Chemistry Cycle */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                🧪 Chemistry Cycle
              </h3>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                20 Credit
              </span>
            </div>
            <div className="space-y-3">
              {chemistrySubjectsCGPA.map((subject) => renderSubjectCard(subject, 'chemistry'))}
            </div>
            {/* Compute SGPA Button */}
            <button
              onClick={() => handleSGPACompute('chemistry')}
              disabled={sgpaToggle.chemistry}
              className={`w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all ${
                sgpaToggle.chemistry 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              Compute SGPA
            </button>
            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            {/* SGPA Input Section */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-900 font-medium">Enter SGPA for Chemistry Cycle</span>
                <button
                  onClick={() => handleSgpaToggle('chemistry')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    sgpaToggle.chemistry ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sgpaToggle.chemistry ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {sgpaToggle.chemistry && (
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  defaultValue={updatedSgpaValues.chemistry || ''}
                  onChange={(e) => handleSgpaValueChange('chemistry', e.target.value)}
                  placeholder="Enter SGPA :"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Compute CGPA Button */}
        <div className="text-center">
          <button
            onClick={handleFinalCGPACompute}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Compute CGPA
          </button>
        </div>
      </div>
    );
  };

  const SubjectsView = () => {
    const subjects = getSubjects();

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              handleSetCurrentCycle(''); // Only clear currentCycle
              saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, '');
              // Do NOT clear formData, subjectGrades, or updatedFormData here!
            }}
            className="flex items-center group"
            title="Back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors font-medium">Back</span>
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
            </h2>
            <p className="text-gray-600 text-lg">
              
            </p>
          </div>
          <div className="w-32"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectForm 
              key={subject.id} 
              subject={subject} 
              formData={formData}
              currentMode={currentMode}
              onCalculate={calculateSubject}
              subjectGrades={subjectGrades}
              getGradeLetter={getGradeLetter}
              onShowSEERequirements={showSEERequirements}
            />
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            Grade Scale Reference
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              { grade: '10', letter: 'O' },
              { grade: '9', letter: 'A+' },
              { grade: '8', letter: 'A' },
              { grade: '7', letter: 'B+' },
              { grade: '6', letter: 'B' },
              { grade: '5', letter: 'C' },
              { grade: '4', letter: 'P' },
              { grade: '<4', letter: 'F' }
            ].map((item, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-900">{item.grade}</div>
                <div className="text-sm text-gray-600 mt-1">{item.letter}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Marks Button */}
        <button
          onClick={handleResetCIEFinalisationMarks}
          className="fixed top-6 right-6 bg-white hover:bg-grey text-black px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 text-sm border border-gray-200"
          title="Reset all marks and clear saved data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Marks
        </button>
      </div>
    );
  };
  
  const BugReportButton = () => {
    const [showBugOptions, setShowBugOptions] = useState(false);
    let bugOptionsTimeout = null;

    // Helper to clear any pending timeout
    const clearBugOptionsTimeout = () => {
      if (bugOptionsTimeout) {
        clearTimeout(bugOptionsTimeout);
        bugOptionsTimeout = null;
      }
    };

    // Show popup immediately on mouse enter
    const handleMouseEnter = () => {
      clearBugOptionsTimeout();
      setShowBugOptions(true);
    };

    // Hide popup with a slight delay to allow moving between button and popup
    const handleMouseLeave = () => {
      clearBugOptionsTimeout();
      bugOptionsTimeout = setTimeout(() => setShowBugOptions(false), 120);
    };

    return (
      <div className="fixed bottom-6 right-6 z-40" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="relative">
          {/* Main Bug Report Button */}
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Report Bugs / Contribute
          </button>

          {/* Hover Options Bubble */}
          <div className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ${
            showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[180px]">
              <div className="space-y-2">
                {/* GitHub Button */}
                <a 
                  href="https://github.com/VivaanHooda/rvce-grade-calculator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Github className="w-5 h-5 text-gray-700 group-hover:text-black" />
                  <span className="text-gray-700 group-hover:text-black font-medium">GitHub</span>
                </a>
                {/* Gmail Button */}
                <a 
                  href="mailto:vivaanhooda.is24@rvce.edu.in"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <svg className="w-5 h-5 text-red-500 group-hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-700 group-hover:text-black font-medium">Gmail</span>
                </a>
              </div>
              {/* Bubble Arrow */}
              <div className="absolute bottom-0 right-4 transform translate-y-full">
                <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Main navigation logic for restoring state on reload */}
        {!currentMode && <ModeSelection />}
        {currentMode === 'final-cgpa' && <FinalCGPAView />}
        {currentMode && currentMode !== 'final-cgpa' && !currentCycle && <CycleSelection />}
        {currentMode && currentMode !== 'final-cgpa' && currentCycle && <SubjectsView />}
      </div>
      
      <SEERequirementsPopup
        isOpen={seePopup.isOpen}
        onClose={closeSEEPopup}
        cieTotal={seePopup.cieTotal}
        subjectName={seePopup.subject?.name}
      />
      <CGPAResultsPopup
        isOpen={cgpaPopup.isOpen}
        onClose={closeCGPAPopup}
        cgpa={cgpaPopup.cgpa}
      />
      <SGPAResultsPopup
        isOpen={sgpaPopup.isOpen}
        onClose={closeSGPAPopup}
        sgpa={sgpaPopup.sgpa}
        cycleName={sgpaPopup.cycleName}
      />
      <BugReportButton />
    </div>
  );
};

export default CGPACalculator;