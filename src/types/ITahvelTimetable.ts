export interface ITahvelTimeTable {
    studyPeriods: string
    timetableEvents: TimetableEvent[]
    school: School
    isHigher: boolean
    isVocational: boolean
    personalParam: any
    generalTimetableCurriculum: GeneralTimetableCurriculum
}

export interface TimetableEvent {
    id: number
    uuid: any
    eventUuid: any
    journalId: any
    journalUuid?: string
    subjectStudyPeriodId: any
    subjectStudyPeriodUuid: any
    nameEt: string
    nameEn?: string
    date: string
    timeStart: string
    timeEnd: string
    hasStarted: boolean
    teachers: Teacher[]
    rooms: Room[]
    studentGroups: StudentGroup[]
    subgroups: any[]
    students: any[]
    addInfo: any
    singleEvent: boolean
    publicEvent: number
    timetableId?: number
    showStudyMaterials: boolean
    capacityType?: string
    backgroundColor?: string
    textColor: any
    isPersonal?: boolean
    person: any
    isJuhanEvent: boolean
    isConsultation: any
    consultationId: any
    isExam: boolean
    isOngoing: boolean
    includesEventStudents: boolean
    inserted: string
    changed: string
    insertedBy: string
    changedBy: string
    canEdit: any
    canDelete: any
    nameRu: string
}

export interface Teacher {
    id: number
    uuid: string
    name: string
    firstname: string
    lastname: string
}

export interface Room {
    id: number
    uuid: string
    roomCode: string
    buildingCode: string
}

export interface StudentGroup {
    id: number
    uuid: string
    code: string
}

export interface School {
    id: number
    nameEt: string
    nameEn: string
    nameRu: string
}

export interface GeneralTimetableCurriculum {
    studentGroupCode: string
    curriculumCode: string
    nameEt: string
    nameEn: string
}
