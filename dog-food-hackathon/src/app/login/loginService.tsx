import z from "zod";
import urls from "../lib/api/url";
import SCHEMA from "@/lib/globalSchema";
import apiClient from "../lib/api/apiClient";
import { ApiResponse } from "../lib/api/types";
import { UserRole } from "../generated/prisma/enums";
import { UserReturn } from "../lib/types";

const LoginSchema = SCHEMA.USER.LOGIN;

type LoginForm = z.infer<typeof LoginSchema>;


const loginService = {
    loginUser : async (payload : LoginForm) : Promise<ApiResponse<UserReturn>>=> {
        return await apiClient.post(urls.USER.LOGIN , payload);
    }
}

export default loginService
