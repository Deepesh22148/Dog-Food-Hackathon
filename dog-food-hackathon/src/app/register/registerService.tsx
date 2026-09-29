import { registerSchema } from '@/lib/schema/user/registerSchema';
import React from 'react'
import z from 'zod';
import apiClient from '@/app/lib/api/apiClient';
import urls from '@/app/lib/api/url';

type RegisterForm = z.infer<typeof registerSchema>;
const registerService = {
    registerUser : async (payload : RegisterForm) => {
        return await apiClient.post(urls.USER.REGISTER , payload);
    }
}

export default registerService
