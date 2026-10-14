/// <reference types="vite/client" />
import type { DevSetupApi } from '../packages/shared/types';
declare global { interface Window { devsetup: DevSetupApi; } }
