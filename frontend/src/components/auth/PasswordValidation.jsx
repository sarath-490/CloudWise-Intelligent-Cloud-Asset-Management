import { CheckCircle2, XCircle } from 'lucide-react';

const PasswordValidation = ({ password }) => {
  const validations = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
    },
    {
      label: 'At least 1 uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: 'At least 1 lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: 'At least 1 number',
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      label: 'At least 1 special character (@$!%*?&)',
      test: (pwd) => /[@$!%*?&]/.test(pwd),
    },
  ];

  const allValid = validations.every((v) => v.test(password || ''));

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {validations.map((validation, index) => {
        const isValid = validation.test(password);
        return (
          <div key={index} className="flex items-center gap-2 text-xs">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
            <span className={isValid ? 'text-emerald-600' : 'text-slate-500'}>
              {validation.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const validatePassword = (password) => {
  const validations = [
    { test: (pwd) => pwd.length >= 8 },
    { test: (pwd) => /[A-Z]/.test(pwd) },
    { test: (pwd) => /[a-z]/.test(pwd) },
    { test: (pwd) => /[0-9]/.test(pwd) },
    { test: (pwd) => /[@$!%*?&]/.test(pwd) },
  ];
  return validations.every((v) => v.test(password || ''));
};

export default PasswordValidation;
