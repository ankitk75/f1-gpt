import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="app-container">
      <div className="background-grid"></div>
      <div className="app-content">{children}</div>
    </div>
  );
};

export default AppLayout;
