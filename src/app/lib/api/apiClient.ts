import { ApiResponse } from "./types";

class ApiClient {
    public async get<T>(url : string) : Promise<ApiResponse<T>> {
        const response =  await fetch(url , {
            method : "GET"
        });
        return await response.json();
    }
    // R => received and S => send
    public async post<R ,S >(url : string , payload : S) : Promise<ApiResponse<R>> {
        const response = await fetch(url , {
            body : JSON.stringify(payload),
            method : "POST",
            headers : {
                "Content-type" : "application/json"
            }
        })

        return await response.json();
    }

    public async patch<R ,S >(url : string , payload : S) : Promise<ApiResponse<R>> {
        const response = await fetch(url , {
            body : JSON.stringify(payload),
            method : "PATCH",
            headers : {
                "Content-type" : "application/json"
            }
        })
       return await response.json();
    }

    public async delete<T> (url : string) : Promise<ApiResponse<T>> {
        const response = await fetch(url , {
            method : "DELETE"
        })
        return await response.json();
    }

}

const apiClient = new ApiClient();

export default apiClient;