import { useState } from "react";

export const useIpse = () => useState<'idle' | 'pending' | 'success' | 'error'>('idle');