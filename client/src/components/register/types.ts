export type AccountFields = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterStepProps = {
  error: string;
  setError: (message: string) => void;
  clearError: () => void;
  goToStep: (step: number) => void;
};
