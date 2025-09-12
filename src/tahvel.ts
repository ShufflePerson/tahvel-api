import { AxiosInstance } from "axios";
import { ITahvelUser } from "./types/ITahvelUser";


export class Tahvel {
    private GET_USER_ENDPOINT = "https://tahvel.edu.ee/hois_back/user";


    constructor(private authToken: string, private axios: AxiosInstance) { }

    //todo: error handeling
    public async getUser(): Promise<ITahvelUser> {
        const response = await this.axios.get(this.GET_USER_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${this.authToken}`
            }
        });
        return response.data;
    }
}