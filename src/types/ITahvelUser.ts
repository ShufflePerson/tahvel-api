export interface ITahvelUser {
    name: string
    user: number
    person: number
    student: number
    teacher: any
    teacherUuid: any
    studentGroupId: number
    roleCode: string
    school: ITahvelSchool
    basic: boolean
    secondary: boolean
    vocational: boolean
    higher: boolean
    doctoral: boolean
    fullname: string
    type: string
    authorizedRoles: string[]
    users: ITahvelUser[]
    loginMethod: string
    sessionTimeoutInSeconds: number
    teacherGroupIds: any
    studentIds: any
    isCurriculumTeacher: any
    committees: any[]
    curriculums: any
    hasSchoolRole: boolean
    inApplicationCommittee: any
    mustAgreeWithToS: boolean
    curriculumVersion: number
    mustAnswerPoll: boolean
    isAdult: boolean
    color: string
    readOnly: boolean
    allowedFileTypes: string[]
    allowedFileExtensions: string[]
    isSecondaryTeacher: any
    isVocationalTeacher: any
    isHigherTeacher: any
}

export interface ITahvelSchool {
    id: number
    basic: boolean
    secondary: boolean
    vocational: boolean
    higher: boolean
    doctoral: boolean
    letterGrades: boolean
    withoutEkis: boolean
    hasPinalCertificateNr: boolean
    hmodules: boolean
    ehisSchool: string
    timetableType: string
    logo: string
    studentGroupTeacherJournal: boolean
    loadEap: boolean
    pinal: boolean
    notAbsence: boolean
}

export interface ITahvelUser {
    id: number
    schoolCode: string
    role: string
    nameEt: string
    nameEn: string
    studentName: string
    studentGroup: string
    default: any
}
