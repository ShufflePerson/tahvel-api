import { AxiosInstance } from "axios";
import { ITahvelUser } from "./types/ITahvelUser";
import { ITahvelUserAttributes } from "./types/ITahvelUserAttributes";
import { ITahvelTimeTable } from "./types/ITahvelTimetable";

//todo: error handeling for EVREYTHING
//get rid of hardcoded urls
export class Tahvel {
    private GET_USER_ENDPOINT = "https://tahvel.edu.ee/hois_back/user";
    private viewAuthToken: string = "";


    constructor(private authToken: string, private axios: AxiosInstance) { }

    public async getUser(): Promise<ITahvelUser> {
        const response = await this.axios.get(this.GET_USER_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${this.authToken}`
            }
        });
        return response.data;
    }

    public async getUserAttributes(): Promise<ITahvelUserAttributes> {
        const response = await this.axios.get("https://tahveltp.edu.ee/hois_back/student-and-teacher/get-attributes", {
            headers: {
                "cookie": "studentAndTeacherView=" + await this.getViewAuthToken()
            }
        });
        return response.data;
    }

    public async getMetatableViewLink(): Promise<string> {
        const response = await this.axios.get("https://tahvel.edu.ee/hois_back/timetableevents/student-and-teacher-timetable-view-link");
        return response.data.url;
    }

    public async getViewAuthToken(): Promise<string> {
        const metatableViewLink = await this.getMetatableViewLink();
        const parsedAuthToken = metatableViewLink.split(`?viewAuth=`)[1];
        this.viewAuthToken = parsedAuthToken;
        return parsedAuthToken;
    }


    public async getTimetable(studentGroupUuid: string, schoolId: number, from: Date, to: Date): Promise<ITahvelTimeTable> {
        const query = `from=${from.toISOString()}&lang=ET&studentGroupUuid=${studentGroupUuid}&thru=${to.toISOString()}`;
        const response = await this.axios.get(`https://tahveltp.edu.ee/hois_back/student-and-teacher/timetableevents/timetableByGroup/${schoolId.toString()}?${query}`, {
            headers: {
                "cookie": "studentAndTeacherView=" + await this.getViewAuthToken()
            }
        });
        return response.data;
    }
}