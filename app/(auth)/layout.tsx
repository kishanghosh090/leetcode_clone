import React from "react";

const AuthLayOut = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex items-center justify-center h-screen">
      {children}
    </main>
  );
};

export default AuthLayOut;
