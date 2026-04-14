import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../../lib/queryClient";

const QueryClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
};

export default QueryClientWrapper;