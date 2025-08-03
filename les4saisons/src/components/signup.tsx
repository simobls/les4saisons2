// src/pages/Signup.tsx
import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignupPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </div>
  );
};

export default SignupPage;
