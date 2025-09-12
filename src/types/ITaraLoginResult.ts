export interface ITaraLoginResult {
    data?: ITaraLoginData;
    error?: ITaraLoginError;
}

export interface ITaraLoginError {
    body: string;
};
export interface ITaraLoginData {
    controlCode: string;
};