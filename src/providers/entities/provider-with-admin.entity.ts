import { Provider } from './provider.entity';

export class ProviderWithAdmin {
  provider: Provider;
  adminCredentials?: {
    username: string;
    email: string | null;
  };
} 